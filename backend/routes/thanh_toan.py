from flask import Blueprint, request, jsonify
from db import get_db

thanh_toan_bp = Blueprint("thanh_toan", __name__)

# =========================
# THANH TOÁN ĐƠN HÀNG
# =========================
@thanh_toan_bp.route("/thanh-toan", methods=["POST"])
def thanh_toan():
    data = request.json
    donHang_id = data.get("donHang_id")
    phuongThuc = data.get("phuongThuc")  # COD | Chuyển khoản

    if not donHang_id or not phuongThuc:
        return jsonify({
            "success": False,
            "message": "Thiếu thông tin thanh toán"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # 1️⃣ Kiểm tra đơn hàng
    cursor.execute("""
        SELECT id, trangThai
        FROM DonHang
        WHERE id = ?
    """, (donHang_id,))

    don_hang = cursor.fetchone()

    if not don_hang:
        return jsonify({
            "success": False,
            "message": "Đơn hàng không tồn tại"
        }), 404

    # 2️⃣ Ghi thanh toán
    cursor.execute("""
        INSERT INTO ThanhToan
        (donHang_id, phuongThuc, trangThai)
        VALUES (?, ?, N'Đã thanh toán')
    """, (donHang_id, phuongThuc))

    # 3️⃣ Cập nhật trạng thái đơn hàng
    cursor.execute("""
        UPDATE DonHang
        SET trangThai = N'Đã thanh toán'
        WHERE id = ?
    """, (donHang_id,))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Thanh toán thành công"
    })


# =====================================================
# ADMIN - XEM THANH TOÁN THEO ĐƠN HÀNG
# =====================================================
@thanh_toan_bp.route("/don-hang/<int:donHang_id>", methods=["GET"])
def get_thanh_toan_by_don_hang(donHang_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            tt.id,
            tt.phuongThuc,
            tt.trangThai,
            tt.ngayThanhToan
        FROM ThanhToan tt
        WHERE tt.donHang_id = ?
    """, (donHang_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "phuongThuc": r[1],
            "trangThai": r[2],
            "ngayThanhToan": r[3]
        })

    return jsonify(data)
