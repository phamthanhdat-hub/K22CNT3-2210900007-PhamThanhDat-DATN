from flask import Blueprint, request, jsonify
from db import get_db

gio_hang_bp = Blueprint("gio_hang", __name__)

# =========================
# LẤY GIỎ HÀNG THEO USER
# =========================
@gio_hang_bp.route("/gio-hang/<int:nguoiDung_id>", methods=["GET"])
def get_gio_hang(nguoiDung_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT gh.id, sp.tenSanPham, sp.gia, sp.hinhAnh,
               gh.soLuong, (sp.gia * gh.soLuong) AS tamTinh
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, (nguoiDung_id,))

    rows = cursor.fetchall()

    data = []
    for r in rows:
        data.append({
            "gioHang_id": r[0],
            "tenSanPham": r[1],
            "gia": float(r[2]),
            "hinhAnh": r[3],
            "soLuong": r[4],
            "tamTinh": float(r[5])
        })

    return jsonify(data)


# =========================
# THÊM VÀO GIỎ
# =========================
@gio_hang_bp.route("/gio-hang", methods=["POST"])
def them_gio_hang():
    data = request.json
    nguoiDung_id = data["nguoiDung_id"]
    sanPham_id = data["sanPham_id"]
    soLuong = data.get("soLuong", 1)

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra đã tồn tại trong giỏ chưa
    cursor.execute("""
        SELECT id, soLuong
        FROM GioHang
        WHERE nguoiDung_id = ? AND sanPham_id = ?
    """, (nguoiDung_id, sanPham_id))

    row = cursor.fetchone()

    if row:
        cursor.execute("""
            UPDATE GioHang
            SET soLuong = soLuong + ?
            WHERE id = ?
        """, (soLuong, row[0]))
    else:
        cursor.execute("""
            INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
            VALUES (?, ?, ?)
        """, (nguoiDung_id, sanPham_id, soLuong))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Đã thêm vào giỏ hàng"
    })


# =========================
# CẬP NHẬT SỐ LƯỢNG
# =========================
@gio_hang_bp.route("/gio-hang/<int:id>", methods=["PUT"])
def cap_nhat_gio_hang(id):
    data = request.json
    soLuong = data["soLuong"]

    if soLuong <= 0:
        return jsonify({"message": "Số lượng không hợp lệ"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE GioHang
        SET soLuong = ?
        WHERE id = ?
    """, (soLuong, id))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Cập nhật thành công"
    })


# =========================
# XÓA SẢN PHẨM KHỎI GIỎ
# =========================
@gio_hang_bp.route("/gio-hang/<int:id>", methods=["DELETE"])
def xoa_gio_hang(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM GioHang WHERE id = ?", (id,))
    conn.commit()

    return jsonify({
        "success": True,
        "message": "Đã xóa sản phẩm"
    })
