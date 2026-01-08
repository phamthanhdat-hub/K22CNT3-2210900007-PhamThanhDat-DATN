from flask import Blueprint, request, jsonify
from db import get_db

from utils.jwt_helper import tao_token, lay_user_tu_token   

# =================================================
# AUTH ROUTES
# =================================================
auth_bp = Blueprint("auth", __name__)

# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
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

        # Tìm user trong database
        cursor.execute("""
            SELECT id, hoTen, email, vaiTro, dienThoai, diaChi
            FROM NguoiDung
            WHERE email = ? AND matKhau = ? AND trangThai = 1
        """, (email, matKhau))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "success": False,
                "message": "Sai email hoặc mật khẩu. Vui lòng kiểm tra lại"
            }), 401

        # Tạo JWT token
        token = tao_token({
            "id": user[0],
            "hoTen": user[1],
            "email": user[2],
            "vaiTro": user[3]
        })

        return jsonify({
            "success": True,
            "token": token,
            "nguoiDung": {
                "id": user[0],
                "hoTen": user[1],
                "email": user[2],
                "vaiTro": user[3],
                "dienThoai": user[4],
                "diaChi": user[5]
            }
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =========================
# REGISTER (KHÁCH HÀNG)
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
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

        # Thêm khách hàng mới vào database
        cursor.execute("""
            INSERT INTO NguoiDung
            (hoTen, email, matKhau, dienThoai, diaChi, vaiTro, trangThai)
            VALUES (?, ?, ?, ?, ?, N'khach', 1)
        """, (
            hoTen,
            email,
            matKhau,
            dienThoai,
            diaChi
        ))

        # Commit để lưu vào database
        conn.commit()

        # Lấy thông tin user vừa tạo
        cursor.execute("""
            SELECT id, hoTen, email, vaiTro
            FROM NguoiDung
            WHERE email = ?
        """, (email,))
        
        new_user = cursor.fetchone()

        return jsonify({
            "success": True,
            "message": "Đăng ký thành công",
            "user": {
                "id": new_user[0],
                "hoTen": new_user[1],
                "email": new_user[2],
                "vaiTro": new_user[3]
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


# =========================
# CẬP NHẬT THÔNG TIN KHÁCH HÀNG
# =========================
@auth_bp.route("/update-profile", methods=["PUT"])
def update_profile():
    try:
        data = request.json
        
        if not data or "id" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin người dùng"
            }), 400

        nguoiDung_id = data["id"]
        hoTen = data.get("hoTen", "").strip()
        dienThoai = data.get("dienThoai", "").strip()
        diaChi = data.get("diaChi", "").strip()

        # Validation
        if not hoTen or len(hoTen) < 2:
            return jsonify({
                "success": False,
                "message": "Họ và tên phải có ít nhất 2 ký tự"
            }), 400

        if not dienThoai:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập số điện thoại"
            }), 400

        # Validate số điện thoại
        import re
        phone_pattern = r'^[0-9]{10,11}$'
        if not re.match(phone_pattern, dienThoai):
            return jsonify({
                "success": False,
                "message": "Số điện thoại không hợp lệ (phải có 10-11 chữ số)"
            }), 400

        if not diaChi or len(diaChi) < 10:
            return jsonify({
                "success": False,
                "message": "Địa chỉ phải có ít nhất 10 ký tự"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra user tồn tại
        cursor.execute("SELECT id FROM NguoiDung WHERE id = ?", (nguoiDung_id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy người dùng"
            }), 404

        # Cập nhật thông tin vào database
        cursor.execute("""
            UPDATE NguoiDung
            SET hoTen = ?, dienThoai = ?, diaChi = ?
            WHERE id = ?
        """, (hoTen, dienThoai, diaChi, nguoiDung_id))

        conn.commit()

        return jsonify({
            "success": True,
            "message": "Cập nhật thông tin thành công"
        })

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

