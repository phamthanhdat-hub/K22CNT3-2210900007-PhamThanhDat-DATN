from flask import Blueprint, jsonify, request
from db import get_db

admin_tin_tuc_bp = Blueprint("admin_tin_tuc", __name__)

# =====================================================
# LẤY TẤT CẢ TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("", methods=["GET"])
def get_all_tin_tuc():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh,
            tt.ngayDang, nd.hoTen, tt.nguoiDung_id
        FROM TinTuc tt
        LEFT JOIN NguoiDung nd ON tt.nguoiDung_id = nd.id
        ORDER BY tt.ngayDang DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tieuDe": r[1],
            "noiDung": r[2],
            "hinhAnh": r[3],
            "ngayDang": r[4].isoformat() if r[4] else None,
            "nguoiDang": r[5],
            "nguoiDung_id": r[6]
        })

    return jsonify(data)

# =====================================================
# CẬP NHẬT TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("/<int:id>", methods=["PUT"])
def update_tin_tuc(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE TinTuc
        SET tieuDe = ?, noiDung = ?, hinhAnh = ?
        WHERE id = ?
    """, (
        data["tieuDe"],
        data.get("noiDung"),
        data.get("hinhAnh"),
        id
    ))

    conn.commit()
    return jsonify({"success": True, "message": "Cập nhật tin tức thành công"})

# =====================================================
# XÓA TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("/<int:id>", methods=["DELETE"])
def delete_tin_tuc(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM TinTuc WHERE id = ?", (id,))
    conn.commit()

    return jsonify({"success": True, "message": "Xóa tin tức thành công"})

