from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import tao_token

admin_auth_bp = Blueprint("admin_auth_bp", __name__)

@admin_auth_bp.route("/login", methods=["POST"])
def login_admin():
    try:
        data = request.json
        email = data.get("email", "").strip()
        matKhau = data.get("matKhau", "")

        if not email or not matKhau:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập đầy đủ email và mật khẩu"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Tìm admin trong database
        cursor.execute("""
            SELECT id, hoTen, email, dienThoai, diaChi
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
                "message": "Sai email hoặc mật khẩu. Hoặc tài khoản không có quyền admin"
            }), 401

        # Tạo JWT token
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
                "vaiTro": "admin",
                "dienThoai": admin[3],
                "diaChi": admin[4]
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =========================
# REGISTER ADMIN (OPTIONAL - CHỈ DÀNH CHO SUPER ADMIN)
# =========================
@admin_auth_bp.route("/register", methods=["POST"])
def register_admin():
    try:
        data = request.json

        hoTen = data.get("hoTen", "").strip()
        email = data.get("email", "").strip()
        matKhau = data.get("matKhau", "")
        dienThoai = data.get("dienThoai", "").strip() or None
        diaChi = data.get("diaChi", "").strip() or None

        # Validation
        if not hoTen or not email or not matKhau:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập đầy đủ họ tên, email và mật khẩu"
            }), 400

        if len(matKhau) < 6:
            return jsonify({
                "success": False,
                "message": "Mật khẩu phải có ít nhất 6 ký tự"
            }), 400

        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({
                "success": False,
                "message": "Email không hợp lệ"
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
                "message": "Email đã tồn tại. Vui lòng sử dụng email khác"
            }), 400

        # Thêm admin mới vào database
        cursor.execute("""
            INSERT INTO NguoiDung
            (hoTen, email, matKhau, dienThoai, diaChi, vaiTro, trangThai)
            VALUES (?, ?, ?, ?, ?, N'admin', 1)
        """, (
            hoTen,
            email,
            matKhau,
            dienThoai,
            diaChi
        ))

        # Commit để lưu vào database
        conn.commit()

        # Lấy thông tin admin vừa tạo
        cursor.execute("""
            SELECT id, hoTen, email, vaiTro
            FROM NguoiDung
            WHERE email = ?
        """, (email,))
        
        new_admin = cursor.fetchone()

        return jsonify({
            "success": True,
            "message": "Đăng ký admin thành công",
            "admin": {
                "id": new_admin[0],
                "hoTen": new_admin[1],
                "email": new_admin[2],
                "vaiTro": new_admin[3]
            }
        })

    except Exception as e:
        # Rollback nếu có lỗi
        if 'conn' in locals():
            conn.rollback()
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
