from flask import Blueprint, jsonify, request
from db import get_db

admin_lien_he_bp = Blueprint("admin_lien_he", __name__)

# =====================================================
# LẤY TẤT CẢ LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("", methods=["GET"])
def get_all_lien_he():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, hoTen, email, noiDung, ngayGui
        FROM LienHe
        ORDER BY ngayGui DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "hoTen": r[1],
            "email": r[2],
            "noiDung": r[3],
            "ngayGui": r[4].isoformat() if r[4] else None
        })

    return jsonify(data)

# =====================================================
# XÓA LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["DELETE"])
def delete_lien_he(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM LienHe WHERE id = ?", (id,))
    conn.commit()

    return jsonify({"success": True, "message": "Xóa liên hệ thành công"})

