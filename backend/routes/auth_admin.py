from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import tao_token

admin_auth_bp = Blueprint("admin_auth_bp", __name__)

@admin_auth_bp.route("/login", methods=["POST"])
def login_admin():
    data = request.json
    email = data.get("email")
    matKhau = data.get("matKhau")

    if not email or not matKhau:
        return jsonify({
            "success": False,
            "message": "Thiếu thông tin đăng nhập"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, hoTen, email
        FROM NguoiDung
        WHERE email = ?
          AND matKhau = ?
          AND vaiTro = N'admin'
          AND trangThai = 1
    """, (email, matKhau))

    admin = cursor.fetchone()
    if not admin:
        return jsonify({
            "success": False,
            "message": "Tài khoản admin không hợp lệ"
        }), 401

    token = tao_token({
        "id": admin[0],
        "email": admin[2],
        "hoTen": admin[1],
        "vaiTro": "admin"
    })

    return jsonify({
        "success": True,
        "token": token,
        "admin": {
            "id": admin[0],
            "hoTen": admin[1],
            "email": admin[2],
            "vaiTro": "admin"
        }
    })
