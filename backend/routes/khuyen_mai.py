from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

khuyen_mai_bp = Blueprint("khuyen_mai", __name__)

# =========================
# ÁP DỤNG KHUYẾN MÃI
# =========================
@khuyen_mai_bp.route("/khuyen-mai/ap-dung", methods=["POST"])
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
    if loai == "phan_tram":
        soTienGiam = tongTien * giaTri / 100
        if giaTriToiDa:
            soTienGiam = min(soTienGiam, giaTriToiDa)
    else:
        soTienGiam = giaTri

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
