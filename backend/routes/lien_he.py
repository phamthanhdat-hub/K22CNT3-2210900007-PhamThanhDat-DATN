from flask import Blueprint, jsonify, request
from db import get_db

lien_he_bp = Blueprint("lien_he", __name__)

# ===============================
# KHÁCH GỬI LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["POST"])
def gui_lien_he():
    try:
        data = request.json
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu"
            }), 400
        
        hoTen = data.get("hoTen", "").strip()
        email = data.get("email", "").strip()
        noiDung = data.get("noiDung", "").strip()
        
        # Validation
        if not hoTen or len(hoTen) < 2:
            return jsonify({
                "success": False,
                "message": "Họ tên phải có ít nhất 2 ký tự"
            }), 400
        
        if not email:
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập email"
            }), 400
        
        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({
                "success": False,
                "message": "Email không hợp lệ"
            }), 400
        
        if not noiDung or len(noiDung) < 10:
            return jsonify({
                "success": False,
                "message": "Nội dung phải có ít nhất 10 ký tự"
            }), 400
        
        if len(noiDung) > 500:
            return jsonify({
                "success": False,
                "message": "Nội dung không được vượt quá 500 ký tự"
            }), 400
        
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO LienHe (hoTen, email, noiDung)
            VALUES (?, ?, ?)
        """, (hoTen, email, noiDung))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất."
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# ===============================
# ADMIN - XEM LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["GET"])
def get_lien_he():
    try:
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
                "hoTen": r[1] or "",
                "email": r[2] or "",
                "noiDung": r[3] or "",
                "ngayGui": r[4].isoformat() if r[4] else None
            })

        return jsonify(data)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
