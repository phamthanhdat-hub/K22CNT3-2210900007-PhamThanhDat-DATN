from flask import Blueprint, jsonify
from utils.db import get_connection

san_pham_bp = Blueprint('san_pham', __name__)

# =========================
# LẤY DANH SÁCH SẢN PHẨM
# =========================
@san_pham_bp.route('/san-pham', methods=['GET'])
def get_san_pham():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, tenSanPham, gia, hinhAnh, trangThai
        FROM SanPham
    """)

    data = []
    for r in cur.fetchall():
        data.append({
            "id": r.id,
            "tenSanPham": r.tenSanPham,
            "gia": r.gia,
            "hinhAnh": r.hinhAnh,
            "trangThai": r.trangThai
        })

    return jsonify(data)

# =========================
# CHI TIẾT SẢN PHẨM (CÁI BẠN HỎI)
# =========================
@san_pham_bp.route('/san-pham/<int:id>', methods=['GET'])
def chi_tiet(id):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM SanPham WHERE id = ?", id)
    r = cur.fetchone()

    if not r:
        return jsonify({"error": "Không tìm thấy sản phẩm"}), 404

    return jsonify({
        "id": r.id,
        "tenSanPham": r.tenSanPham,
        "moTa": r.moTa,
        "gia": r.gia,
        "hinhAnh": r.hinhAnh,
        "nguyenLieu": r.nguyenLieu,
        "protein": r.protein,
        "carb": r.carb,
        "chatBeo": r.chatBeo
    })
