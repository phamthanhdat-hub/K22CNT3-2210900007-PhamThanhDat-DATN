from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import lay_user_tu_token

gio_hang_bp = Blueprint("gio_hang", __name__)

# =====================================================
# GET GIỎ HÀNG (THEO TOKEN)
# =====================================================
@gio_hang_bp.route("", methods=["GET"])
def get_gio_hang():
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            gh.id AS gioHang_id,
            sp.id AS sanPham_id,
            sp.tenSanPham,
            sp.gia,
            sp.hinhAnh,
            gh.soLuong
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, (nguoiDung_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "gioHang_id": r[0],
            "sanPham_id": r[1],
            "tenSanPham": r[2],
            "gia": float(r[3]),
            "hinhAnh": r[4],
            "soLuong": r[5]
        })

    return jsonify(data)


# =====================================================
# THÊM VÀO GIỎ
# =====================================================
@gio_hang_bp.route("", methods=["POST"])
def add_to_cart():
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]
    data = request.json
    sanPham_id = data["sanPham_id"]
    soLuong = data.get("soLuong", 1)

    conn = get_db()
    cursor = conn.cursor()

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
    return jsonify({"success": True})


# =====================================================
# CẬP NHẬT SỐ LƯỢNG
# =====================================================
@gio_hang_bp.route("/<int:id>", methods=["PUT"])
def update_so_luong(id):
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    soLuong = request.json["soLuong"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE GioHang
        SET soLuong = ?
        WHERE id = ?
    """, (soLuong, id))

    conn.commit()
    return jsonify({"success": True})


# =====================================================
# XÓA SẢN PHẨM
# =====================================================
@gio_hang_bp.route("/<int:id>", methods=["DELETE"])
def delete_item(id):
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM GioHang WHERE id = ?", (id,))
    conn.commit()

    return jsonify({"success": True})
