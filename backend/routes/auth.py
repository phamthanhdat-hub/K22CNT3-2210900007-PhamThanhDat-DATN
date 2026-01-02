from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_connection

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/dang-ky', methods=['POST'])
def dang_ky():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO NguoiDung (hoTen, email, matKhau, vaiTro)
        VALUES (?, ?, ?, N'khach')
    """, data['hoTen'], data['email'],
         generate_password_hash(data['matKhau']))

    conn.commit()
    return jsonify({"message": "Đăng ký thành công"})

@auth_bp.route('/dang-nhap', methods=['POST'])
def dang_nhap():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, matKhau, vaiTro FROM NguoiDung WHERE email=?", data['email'])
    user = cur.fetchone()

    if user and check_password_hash(user[1], data['matKhau']):
        return jsonify({
            "id": user[0],
            "vaiTro": user[2]
        })

    return jsonify({"error": "Sai thông tin"}), 401
