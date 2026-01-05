from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import tao_token   

# =================================================
# AUTH ROUTES
# =================================================
auth_bp = Blueprint("auth", __name__)

# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    matKhau = data.get("matKhau")

    if not email or not matKhau:
        return jsonify({
            "success": False,
            "message": "Thiếu email hoặc mật khẩu"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, hoTen, vaiTro
        FROM NguoiDung
        WHERE email = ? AND matKhau = ? AND trangThai = 1
    """, (email, matKhau))

    user = cursor.fetchone()

    if not user:
        return jsonify({
            "success": False,
            "message": "Sai tài khoản hoặc mật khẩu"
        }), 401

    # Tạo JWT token
    token = tao_token({
        "id": user[0],
        "hoTen": user[1],
        "vaiTro": user[2]
    })

    return jsonify({
        "success": True,
        "token": token,
        "nguoiDung": {
            "id": user[0],
            "hoTen": user[1],
            "vaiTro": user[2]
        }
    })


# =========================
# REGISTER (KHÁCH HÀNG)
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    hoTen = data.get("hoTen")
    email = data.get("email")
    matKhau = data.get("matKhau")
    dienThoai = data.get("dienThoai")
    diaChi = data.get("diaChi")

    if not hoTen or not email or not matKhau:
        return jsonify({
            "success": False,
            "message": "Vui lòng nhập đầy đủ họ tên, email và mật khẩu"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra email đã tồn tại
    cursor.execute(
        "SELECT id FROM NguoiDung WHERE email = ?",
        (email,)
    )
    if cursor.fetchone():
        return jsonify({
            "success": False,
            "message": "Email đã tồn tại"
        }), 400

    # Thêm khách hàng mới
    cursor.execute("""
        INSERT INTO NguoiDung
        (hoTen, email, matKhau, dienThoai, diaChi, vaiTro)
        VALUES (?, ?, ?, ?, ?, N'khach')
    """, (
        hoTen,
        email,
        matKhau,
        dienThoai,
        diaChi
    ))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Đăng ký thành công"
    })

