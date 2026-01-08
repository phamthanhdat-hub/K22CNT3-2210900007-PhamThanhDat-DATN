from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

khuyen_mai_bp = Blueprint("khuyen_mai", __name__)

# =========================
# LẤY DANH SÁCH KHUYẾN MÃI ĐANG HOẠT ĐỘNG
# =========================
@khuyen_mai_bp.route("/", methods=["GET"])
def get_all_khuyen_mai():
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now()

    cursor.execute("""
        SELECT 
            id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
            giaTriGiam, giaTriToiDa, donHangToiThieu,
            ngayBatDau, ngayKetThuc, trangThai
        FROM KhuyenMai
        WHERE trangThai = 1
          AND ngayBatDau <= ?
          AND ngayKetThuc >= ?
        ORDER BY ngayKetThuc ASC
    """, (now, now))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tenKhuyenMai": r[1],
            "maKhuyenMai": r[2],
            "loaiGiamGia": r[3],
            "giaTriGiam": float(r[4]) if r[4] else 0,
            "giaTriToiDa": float(r[5]) if r[5] else None,
            "donHangToiThieu": float(r[6]) if r[6] else None,
            "ngayBatDau": r[7].isoformat() if r[7] else None,
            "ngayKetThuc": r[8].isoformat() if r[8] else None,
            "trangThai": r[9]
        })

    return jsonify(data)

# =========================
# ÁP DỤNG KHUYẾN MÃI
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
