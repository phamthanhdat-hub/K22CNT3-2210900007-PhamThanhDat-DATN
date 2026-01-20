from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

khuyen_mai_bp = Blueprint("khuyen_mai", __name__)

# =========================
# LẤY DANH SÁCH KHUYẾN MÃI (TẤT CẢ)
# =========================
@khuyen_mai_bp.route("/", methods=["GET"])
def get_all_khuyen_mai():
    conn = None
    try:
        print("🔄 Bắt đầu xử lý request GET /api/khuyen-mai")
        conn = get_db()
        cursor = conn.cursor()
        
        # Lấy tham số query (nếu có)
        only_active = request.args.get("only_active", "false").lower() == "true"
        print(f"📋 only_active = {only_active}")
        
        if only_active:
            # Chỉ lấy mã đang hoạt động (dùng cho trang chủ)
            now = datetime.now()
            print(f"⏰ Thời gian hiện tại: {now}")
            cursor.execute("""
                SELECT 
                    id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
                    giaTriGiam, giaTriToiDa, donHangToiThieu,
                    ngayBatDau, ngayKetThuc, trangThai
                FROM KhuyenMai
                WHERE trangThai = 1
                  AND (ngayBatDau IS NULL OR ngayBatDau <= ?)
                  AND (ngayKetThuc IS NULL OR ngayKetThuc >= ?)
                ORDER BY ngayKetThuc ASC
            """, (now, now))
        else:
            # Lấy tất cả mã khuyến mãi (dùng cho trang khuyến mãi)
            now = datetime.now()
            print(f"⏰ Lấy tất cả mã khuyến mãi, thời gian hiện tại: {now}")
            cursor.execute("""
                SELECT 
                    id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
                    giaTriGiam, giaTriToiDa, donHangToiThieu,
                    ngayBatDau, ngayKetThuc, trangThai
                FROM KhuyenMai
                WHERE trangThai = 1
                ORDER BY 
                    CASE 
                        WHEN (ngayKetThuc IS NULL OR ngayKetThuc >= ?) 
                             AND (ngayBatDau IS NULL OR ngayBatDau <= ?) THEN 1
                        ELSE 2
                    END,
                    ngayKetThuc ASC
            """, (now, now))

        rows = cursor.fetchall()
        print(f"📊 Số dòng query được: {len(rows)}")
        data = []

        for idx, r in enumerate(rows):
            try:
                # Xử lý datetime để tránh lỗi None
                ngay_bat_dau = None
                ngay_ket_thuc = None
                
                if r[7]:  # ngayBatDau
                    try:
                        if hasattr(r[7], 'isoformat'):
                            ngay_bat_dau = r[7].isoformat()
                        else:
                            ngay_bat_dau = str(r[7])
                    except Exception as e:
                        print(f"⚠️ Lỗi xử lý ngayBatDau cho row {idx}: {e}")
                        ngay_bat_dau = None
                
                if r[8]:  # ngayKetThuc
                    try:
                        if hasattr(r[8], 'isoformat'):
                            ngay_ket_thuc = r[8].isoformat()
                        else:
                            ngay_ket_thuc = str(r[8])
                    except Exception as e:
                        print(f"⚠️ Lỗi xử lý ngayKetThuc cho row {idx}: {e}")
                        ngay_ket_thuc = None
                
                # Xử lý BIT (trangThai)
                trang_thai = False
                if r[9] is not None:
                    if isinstance(r[9], bool):
                        trang_thai = r[9]
                    elif isinstance(r[9], (int, str)):
                        trang_thai = bool(int(r[9]))
                    else:
                        trang_thai = bool(r[9])
                
                item = {
                    "id": int(r[0]) if r[0] else 0,
                    "tenKhuyenMai": str(r[1]) if r[1] else "",
                    "maKhuyenMai": str(r[2]) if r[2] else "",
                    "loaiGiamGia": str(r[3]) if r[3] else "phan_tram",
                    "giaTriGiam": float(r[4]) if r[4] is not None else 0,
                    "giaTriToiDa": float(r[5]) if r[5] is not None else None,
                    "donHangToiThieu": float(r[6]) if r[6] is not None else None,
                    "ngayBatDau": ngay_bat_dau,
                    "ngayKetThuc": ngay_ket_thuc,
                    "trangThai": trang_thai
                }
                
                data.append(item)
                print(f"   ✅ Mã {idx + 1}: {item['maKhuyenMai']} - {item['tenKhuyenMai']}")
                
            except Exception as e:
                print(f"❌ Lỗi xử lý row {idx}: {e}")
                import traceback
                traceback.print_exc()
                continue

        if conn:
            conn.close()
        
        print(f"\n✅ API /api/khuyen-mai trả về {len(data)} mã khuyến mãi")
        if len(data) > 0:
            print(f"   Mẫu dữ liệu đầu tiên: {data[0]}")
        return jsonify(data)
    
    except Exception as e:
        print(f"❌ LỖI API /api/khuyen-mai: {str(e)}")
        import traceback
        traceback.print_exc()
        
        if conn:
            try:
                conn.close()
            except:
                pass
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =========================
# TÍNH TOÁN KHUYẾN MÃI (TRƯỚC KHI TẠO ĐƠN HÀNG)
# =========================
@khuyen_mai_bp.route("/tinh-toan", methods=["POST"])
def tinh_toan_khuyen_mai():
    """Tính toán số tiền giảm dựa trên mã khuyến mãi và tổng tiền giỏ hàng"""
    try:
        data = request.json
        maKhuyenMai = data.get("maKhuyenMai", "").strip()
        tongTien = data.get("tongTien", 0)

        if not maKhuyenMai:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập mã khuyến mãi"
            }), 400

        if tongTien <= 0:
            return jsonify({
                "success": False,
                "message": "Tổng tiền không hợp lệ"
            }), 400

        conn = get_db()
        cursor = conn.cursor()
        now = datetime.now()

        # Lấy thông tin khuyến mãi
        cursor.execute("""
            SELECT id, loaiGiamGia, giaTriGiam,
                   giaTriToiDa, donHangToiThieu,
                   ngayBatDau, ngayKetThuc, trangThai, tenKhuyenMai
            FROM KhuyenMai
            WHERE maKhuyenMai = ?
        """, (maKhuyenMai,))
        
        km = cursor.fetchone()

        if not km:
            return jsonify({
                "success": False,
                "message": "Mã khuyến mãi không tồn tại"
            }), 404

        (khuyenMai_id, loai, giaTri, giaTriToiDa,
         donHangToiThieu, ngayBatDau, ngayKetThuc, trangThai, tenKhuyenMai) = km

        # Kiểm tra trạng thái và thời gian
        if not trangThai:
            return jsonify({
                "success": False,
                "message": "Mã khuyến mãi đã bị vô hiệu hóa"
            }), 400

        if ngayBatDau and now < ngayBatDau:
            return jsonify({
                "success": False,
                "message": f"Mã khuyến mãi chưa có hiệu lực. Có hiệu lực từ {ngayBatDau.strftime('%d/%m/%Y')}"
            }), 400

        if ngayKetThuc and now > ngayKetThuc:
            return jsonify({
                "success": False,
                "message": f"Mã khuyến mãi đã hết hạn. Hết hạn vào {ngayKetThuc.strftime('%d/%m/%Y')}"
            }), 400

        # Kiểm tra đơn hàng tối thiểu
        if donHangToiThieu and tongTien < donHangToiThieu:
            return jsonify({
                "success": False,
                "message": f"Đơn hàng tối thiểu {int(donHangToiThieu):,}đ để áp dụng mã này"
            }), 400

        # Chuyển đổi tất cả giá trị decimal sang float để tránh lỗi
        giaTri = float(giaTri) if giaTri else 0
        giaTriToiDa = float(giaTriToiDa) if giaTriToiDa else None
        donHangToiThieu = float(donHangToiThieu) if donHangToiThieu else None
        tongTien = float(tongTien) if tongTien else 0
        
        # Tính số tiền giảm
        if loai and loai.strip() == "phan_tram":
            soTienGiam = tongTien * giaTri / 100
            if giaTriToiDa:
                soTienGiam = min(soTienGiam, giaTriToiDa)
        else:  # tien_mat
            soTienGiam = giaTri

        soTienGiam = int(soTienGiam)
        tongTienSauGiam = tongTien - soTienGiam

        return jsonify({
            "success": True,
            "message": f"Áp dụng mã '{tenKhuyenMai}' thành công",
            "khuyenMai_id": khuyenMai_id,
            "maKhuyenMai": maKhuyenMai,
            "tenKhuyenMai": tenKhuyenMai,
            "soTienGiam": soTienGiam,
            "tongTienTruocGiam": tongTien,
            "tongTienSauGiam": tongTienSauGiam
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =========================
# ÁP DỤNG KHUYẾN MÃI (SAU KHI TẠO ĐƠN HÀNG)
# =========================
@khuyen_mai_bp.route("/ap-dung", methods=["POST"])
def ap_dung_khuyen_mai():
    data = request.json
    donHang_id = data.get("donHang_id")
    maKhuyenMai = data.get("maKhuyenMai")

    if not donHang_id or not maKhuyenMai:
        return jsonify({
            "success": False,
            "message": "Thiếu thông tin áp dụng khuyến mãi"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1️⃣ Lấy đơn hàng
    cursor.execute("""
        SELECT tongTien
        FROM DonHang
        WHERE id = ?
    """, (donHang_id,))
    dh = cursor.fetchone()

    if not dh:
        return jsonify({
            "success": False,
            "message": "Đơn hàng không tồn tại"
        }), 404

    tongTien = dh[0]

    # 2️⃣ Lấy khuyến mãi
    cursor.execute("""
        SELECT id, loaiGiamGia, giaTriGiam,
               giaTriToiDa, donHangToiThieu,
               ngayBatDau, ngayKetThuc, trangThai
        FROM KhuyenMai
        WHERE maKhuyenMai = ?
    """, (maKhuyenMai,))
    km = cursor.fetchone()

    if not km:
        return jsonify({
            "success": False,
            "message": "Mã khuyến mãi không tồn tại"
        }), 404

    (khuyenMai_id, loai, giaTri, giaTriToiDa,
     donHangToiThieu, ngayBatDau, ngayKetThuc, trangThai) = km

    now = datetime.now()

    if not trangThai or now < ngayBatDau or now > ngayKetThuc:
        return jsonify({
            "success": False,
            "message": "Mã khuyến mãi đã hết hạn hoặc không còn hiệu lực"
        }), 400

    if donHangToiThieu and tongTien < donHangToiThieu:
        return jsonify({
            "success": False,
            "message": f"Đơn hàng tối thiểu {donHangToiThieu:,}đ"
        }), 400

    # 3️⃣ Tính tiền giảm
    # Loại giảm giá: 'phan_tram' hoặc 'tien_mat'
    if loai and loai.strip() == "phan_tram":
        soTienGiam = tongTien * float(giaTri) / 100
        if giaTriToiDa:
            soTienGiam = min(soTienGiam, float(giaTriToiDa))
    else:
        soTienGiam = float(giaTri)

    soTienGiam = int(soTienGiam)

    # 4️⃣ Lưu DonHang_KhuyenMai
    cursor.execute("""
        INSERT INTO DonHang_KhuyenMai
        (donHang_id, khuyenMai_id, soTienGiam)
        VALUES (?, ?, ?)
    """, (donHang_id, khuyenMai_id, soTienGiam))

    # 5️⃣ Cập nhật tổng tiền đơn hàng
    cursor.execute("""
        UPDATE DonHang
        SET tongTien = tongTien - ?
        WHERE id = ?
    """, (soTienGiam, donHang_id))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Áp dụng khuyến mãi thành công",
        "soTienGiam": soTienGiam
    })
