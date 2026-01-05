from flask import Blueprint, jsonify, request
from db import get_db

lien_he_bp = Blueprint("lien_he", __name__)

# ===============================
# KHÁCH GỬI LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["POST"])
def gui_lien_he():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO LienHe (hoTen, email, noiDung)
        VALUES (?, ?, ?)
    """, (
        data["hoTen"],
        data["email"],
        data["noiDung"]
    ))

    conn.commit()
    return jsonify({"success": True})


# ===============================
# ADMIN - XEM LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["GET"])
def get_lien_he():
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
            "ngayGui": r[4]
        })

    return jsonify(data)
