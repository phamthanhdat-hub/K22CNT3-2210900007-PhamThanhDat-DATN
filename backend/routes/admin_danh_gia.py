from flask import Blueprint, jsonify, request
from db import get_db

admin_danh_gia_bp = Blueprint("admin_danh_gia", __name__)

# =====================================================
# LẤY TẤT CẢ ĐÁNH GIÁ
# =====================================================
@admin_danh_gia_bp.route("", methods=["GET"])
def get_all_danh_gia():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dg.id,
            dg.nguoiDung_id,
            nd.hoTen,
            dg.sanPham_id,
            sp.tenSanPham,
            dg.soSao,
            dg.noiDung,
            dg.ngayDanhGia
        FROM DanhGia dg
        JOIN NguoiDung nd ON dg.nguoiDung_id = nd.id
        JOIN SanPham sp ON dg.sanPham_id = sp.id
        ORDER BY dg.ngayDanhGia DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "nguoiDung_id": r[1],
            "hoTen": r[2],
            "sanPham_id": r[3],
            "tenSanPham": r[4],
            "soSao": r[5],
            "noiDung": r[6],
            "ngayDanhGia": r[7].isoformat() if r[7] else None
        })

    return jsonify(data)

# =====================================================
# XÓA ĐÁNH GIÁ
# =====================================================
@admin_danh_gia_bp.route("/<int:id>", methods=["DELETE"])
def delete_danh_gia(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM DanhGia WHERE id = ?", (id,))
    conn.commit()

    return jsonify({"success": True, "message": "Xóa đánh giá thành công"})


