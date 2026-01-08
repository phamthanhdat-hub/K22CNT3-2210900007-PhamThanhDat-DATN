from flask import Blueprint, jsonify, request
from db import get_db

admin_san_pham_bp = Blueprint("admin_san_pham", __name__)

# =====================================================
# LẤY TẤT CẢ SẢN PHẨM (ADMIN - BAO GỒM CẢ ĐÃ XÓA)
# =====================================================
@admin_san_pham_bp.route("", methods=["GET"])
def get_all_san_pham():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            sp.id,
            sp.tenSanPham,
            sp.moTa,
            sp.gia,
            sp.hinhAnh,
            sp.doTuoi,
            sp.protein,
            sp.carb,
            sp.chatBeo,
            sp.danhMuc_id,
            dm.tenDanhMuc,
            sp.ngayTao,
            sp.trangThai
        FROM SanPham sp
        LEFT JOIN DanhMuc dm ON sp.danhMuc_id = dm.id
        ORDER BY sp.ngayTao DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tenSanPham": r[1],
            "moTa": r[2],
            "gia": float(r[3]),
            "hinhAnh": r[4],
            "doTuoi": r[5],
            "protein": r[6],
            "carb": r[7],
            "chatBeo": r[8],
            "danhMuc_id": r[9],
            "tenDanhMuc": r[10],
            "ngayTao": r[11].isoformat() if r[11] else None,
            "trangThai": r[12]
        })

    return jsonify(data)

# =====================================================
# LẤY DANH SÁCH DANH MỤC
# =====================================================
@admin_san_pham_bp.route("/danh-muc", methods=["GET"])
def get_danh_muc():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, tenDanhMuc FROM DanhMuc ORDER BY tenDanhMuc")
    rows = cursor.fetchall()
    data = [{"id": r[0], "tenDanhMuc": r[1]} for r in rows]

    return jsonify(data)

