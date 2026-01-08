from flask import Blueprint, request, jsonify
from db import get_db

don_hang_bp = Blueprint("don_hang", __name__)

# =====================================================
# 1️⃣ LẤY ĐƠN HÀNG THEO NGƯỜI DÙNG
# =====================================================
@don_hang_bp.route("/nguoi-dung/<int:nguoiDung_id>", methods=["GET"])
def get_don_hang_by_user(nguoiDung_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, tongTien, trangThai, ngayDat, diaChiGiaoHang
        FROM DonHang
        WHERE nguoiDung_id = ?
        ORDER BY ngayDat DESC
    """, (nguoiDung_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tongTien": float(r[1]),
            "trangThai": r[2],
            "ngayDat": r[3],
            "diaChiGiaoHang": r[4]
        })

    return jsonify(data)


# =====================================================
# 2️⃣ LẤY CHI TIẾT 1 ĐƠN HÀNG
# =====================================================
@don_hang_bp.route("/<int:donHang_id>", methods=["GET"])
def get_chi_tiet_don_hang(donHang_id):
    conn = get_db()
    cursor = conn.cursor()

    # Thông tin đơn hàng
    cursor.execute("""
        SELECT id, nguoiDung_id, tongTien, trangThai, ngayDat, diaChiGiaoHang
        FROM DonHang
        WHERE id = ?
    """, (donHang_id,))
    dh = cursor.fetchone()

    if not dh:
        return jsonify({"message": "Không tìm thấy đơn hàng"}), 404

    # Chi tiết sản phẩm
    cursor.execute("""
        SELECT 
            sp.tenSanPham,
            ctdh.soLuong,
            ctdh.gia
        FROM ChiTietDonHang ctdh
        JOIN SanPham sp ON ctdh.sanPham_id = sp.id
        WHERE ctdh.donHang_id = ?
    """, (donHang_id,))

    items = cursor.fetchall()
    sanPham = []

    for i in items:
        sanPham.append({
            "tenSanPham": i[0],
            "soLuong": i[1],
            "gia": float(i[2])
        })

    return jsonify({
        "donHang": {
            "id": dh[0],
            "nguoiDung_id": dh[1],
            "tongTien": float(dh[2]),
            "trangThai": dh[3],
            "ngayDat": dh[4],
            "diaChiGiaoHang": dh[5]
        },
        "sanPham": sanPham
    })


# =====================================================
# 3️⃣ TẠO ĐƠN HÀNG TỪ GIỎ HÀNG
# =====================================================
@don_hang_bp.route("", methods=["POST"])
def tao_don_hang():
    try:
        data = request.json
        
        if not data or "nguoiDung_id" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin người dùng"
            }), 400

        nguoiDung_id = data["nguoiDung_id"]
        hoTen = data.get("hoTen", "").strip()
        dienThoai = data.get("dienThoai", "").strip()
        diaChi = data.get("diaChiGiaoHang", "").strip()

        # Validation thông tin
        if not hoTen or len(hoTen) < 2:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập họ và tên (ít nhất 2 ký tự)"
            }), 400

        if not dienThoai:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập số điện thoại"
            }), 400

        # Validate số điện thoại (10-11 số)
        import re
        phone_pattern = r'^[0-9]{10,11}$'
        if not re.match(phone_pattern, dienThoai):
            return jsonify({
                "success": False,
                "message": "Số điện thoại không hợp lệ (phải có 10-11 chữ số)"
            }), 400

        if not diaChi or len(diaChi) < 10:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập địa chỉ giao hàng chi tiết (ít nhất 10 ký tự)"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Lấy giỏ hàng từ database
        cursor.execute("""
            SELECT gh.sanPham_id, gh.soLuong, sp.gia, sp.tenSanPham, sp.trangThai
            FROM GioHang gh
            JOIN SanPham sp ON gh.sanPham_id = sp.id
            WHERE gh.nguoiDung_id = ?
        """, (nguoiDung_id,))
        gio_hang = cursor.fetchall()

        if not gio_hang:
            return jsonify({
                "success": False,
                "message": "Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng"
            }), 400

        # Kiểm tra sản phẩm còn khả dụng không
        unavailable_products = [row[3] for row in gio_hang if not row[4]]
        if unavailable_products:
            return jsonify({
                "success": False,
                "message": f"Sản phẩm không còn khả dụng: {', '.join(unavailable_products)}"
            }), 400

        # Tính tổng tiền ban đầu (chuyển đổi sang float để tránh lỗi decimal)
        tongTienGoc = float(sum(float(row[1]) * float(row[2]) for row in gio_hang))
        tongTien = tongTienGoc
        khuyenMai_id = data.get("khuyenMai_id")
        soTienGiam = 0

        # Xử lý khuyến mãi nếu có
        if khuyenMai_id:
            cursor.execute("""
                SELECT loaiGiamGia, giaTriGiam, giaTriToiDa, donHangToiThieu,
                       ngayBatDau, ngayKetThuc, trangThai
                FROM KhuyenMai
                WHERE id = ?
            """, (khuyenMai_id,))
            
            km = cursor.fetchone()
            if km:
                (loai, giaTri, giaTriToiDa, donHangToiThieu,
                 ngayBatDau, ngayKetThuc, trangThai) = km
                
                from datetime import datetime
                now = datetime.now()
                
                # Chuyển đổi tất cả giá trị decimal sang float
                giaTri = float(giaTri) if giaTri else 0
                giaTriToiDa = float(giaTriToiDa) if giaTriToiDa else None
                donHangToiThieu = float(donHangToiThieu) if donHangToiThieu else None
                
                # Kiểm tra khuyến mãi hợp lệ
                if trangThai and (not ngayBatDau or now >= ngayBatDau) and (not ngayKetThuc or now <= ngayKetThuc):
                    if not donHangToiThieu or tongTienGoc >= donHangToiThieu:
                        # Tính số tiền giảm
                        if loai and loai.strip() == "phan_tram":
                            soTienGiam = tongTienGoc * giaTri / 100
                            if giaTriToiDa:
                                soTienGiam = min(soTienGiam, giaTriToiDa)
                        else:  # tien_mat
                            soTienGiam = giaTri
                        
                        soTienGiam = int(soTienGiam)
                        # Giới hạn số tiền giảm không vượt quá tổng tiền gốc
                        if soTienGiam > tongTienGoc:
                            soTienGiam = int(tongTienGoc)
                        
                        tongTien = tongTienGoc - soTienGiam
                        
                        # Đảm bảo tổng tiền không âm (cho phép = 0 - đơn hàng miễn phí)
                        if tongTien < 0:
                            tongTien = 0
                            soTienGiam = int(tongTienGoc)

        # Đảm bảo tổng tiền cuối cùng >= 0 (cho phép = 0 - đơn hàng miễn phí)
        if tongTien < 0:
            tongTien = 0

        # Lấy thời gian nhận hàng (nếu có)
        thoiGianNhanHang = data.get("thoiGianNhanHang", "").strip() or None
        
        # Tạo đơn hàng trong database
        # Lưu thời gian nhận hàng vào diaChiGiaoHang hoặc tạo cột mới
        # Tạm thời lưu vào diaChiGiaoHang với format: "diaChi | thoiGianNhanHang"
        diaChiFull = diaChi
        if thoiGianNhanHang:
            diaChiFull = f"{diaChi} | Thời gian nhận: {thoiGianNhanHang}"
        
        cursor.execute("""
            INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang)
            OUTPUT INSERTED.id
            VALUES (?, ?, ?)
        """, (nguoiDung_id, tongTien, diaChiFull))

        donHang_id = cursor.fetchone()[0]

        # Thêm chi tiết đơn hàng vào database
        for sp_id, soLuong, gia, _, _ in gio_hang:
            cursor.execute("""
                INSERT INTO ChiTietDonHang
                (donHang_id, sanPham_id, soLuong, gia)
                VALUES (?, ?, ?, ?)
            """, (donHang_id, sp_id, soLuong, gia))

        # Lưu khuyến mãi vào DonHang_KhuyenMai nếu có
        if khuyenMai_id and soTienGiam > 0:
            cursor.execute("""
                INSERT INTO DonHang_KhuyenMai
                (donHang_id, khuyenMai_id, soTienGiam)
                VALUES (?, ?, ?)
            """, (donHang_id, khuyenMai_id, soTienGiam))

        # Xóa giỏ hàng sau khi tạo đơn hàng thành công
        cursor.execute("""
            DELETE FROM GioHang WHERE nguoiDung_id = ?
        """, (nguoiDung_id,))

        # Commit tất cả vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Tạo đơn hàng thành công",
            "donHang_id": donHang_id,
            "tongTien": tongTien,
            "tongTienGoc": tongTienGoc,
            "soTienGiam": soTienGiam
        })

    except Exception as e:
        # Rollback nếu có lỗi
        if 'conn' in locals():
            conn.rollback()
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# 4️⃣ ADMIN – CẬP NHẬT TRẠNG THÁI
# =====================================================
@don_hang_bp.route("/<int:id>/trang-thai", methods=["PUT"])
def cap_nhat_trang_thai(id):
    data = request.json
    trangThai = data["trangThai"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE DonHang
        SET trangThai = ?
        WHERE id = ?
    """, (trangThai, id))

    conn.commit()
    return jsonify({"success": True})
