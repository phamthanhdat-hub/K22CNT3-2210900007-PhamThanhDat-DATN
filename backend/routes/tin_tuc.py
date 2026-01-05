from flask import Blueprint, jsonify, request
from db import get_db

tin_tuc_bp = Blueprint("tin_tuc", __name__)

# ===============================
# LẤY DANH SÁCH TIN TỨC (CLIENT)
# ===============================
@tin_tuc_bp.route("/", methods=["GET"])
def get_all_tin_tuc():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh,
            tt.ngayDang, nd.hoTen
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
            "ngayDang": r[4],
            "nguoiDang": r[5]
        })

    return jsonify(data)


# ===============================
# ADMIN - THÊM TIN TỨC
# ===============================
@tin_tuc_bp.route("/", methods=["POST"])
def create_tin_tuc():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO TinTuc (tieuDe, noiDung, hinhAnh, nguoiDung_id)
        VALUES (?, ?, ?, ?)
    """, (
        data["tieuDe"],
        data.get("noiDung"),
        data.get("hinhAnh"),
        data.get("nguoiDung_id")
    ))

    conn.commit()
    return jsonify({"success": True})
