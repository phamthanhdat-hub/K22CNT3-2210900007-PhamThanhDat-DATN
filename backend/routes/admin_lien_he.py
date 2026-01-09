from flask import Blueprint, jsonify, request
from db import get_db

admin_lien_he_bp = Blueprint("admin_lien_he", __name__)

# =====================================================
# LẤY TẤT CẢ LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("", methods=["GET"])
def get_all_lien_he():
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
                "hoTen": r[1] if r[1] else "",
                "email": r[2] if r[2] else "",
                "noiDung": r[3] if r[3] else "",
                "ngayGui": r[4].isoformat() if r[4] else None
            })

        return jsonify(data)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# TẠO LIÊN HỆ MỚI (ADMIN)
# =====================================================
@admin_lien_he_bp.route("", methods=["POST"])
def create_lien_he():
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
            "message": "Thêm liên hệ thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# LẤY CHI TIẾT 1 LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["GET"])
def get_lien_he_by_id(id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, hoTen, email, noiDung, ngayGui
        FROM LienHe
        WHERE id = ?
    """, (id,))
    
    r = cursor.fetchone()
    if not r:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy liên hệ"
        }), 404
    
    return jsonify({
        "success": True,
        "data": {
            "id": r[0],
            "hoTen": r[1] or "",
            "email": r[2] or "",
            "noiDung": r[3] or "",
            "ngayGui": r[4].isoformat() if r[4] else None
        }
    })

# =====================================================
# CẬP NHẬT LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["PUT"])
def update_lien_he(id):
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
        
        # Kiểm tra liên hệ có tồn tại không
        cursor.execute("SELECT id FROM LienHe WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy liên hệ"
            }), 404

        cursor.execute("""
            UPDATE LienHe
            SET hoTen = ?, email = ?, noiDung = ?
            WHERE id = ?
        """, (hoTen, email, noiDung, id))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Cập nhật liên hệ thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# XÓA LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["DELETE"])
def delete_lien_he(id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra liên hệ có tồn tại không
        cursor.execute("SELECT id FROM LienHe WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy liên hệ"
            }), 404

        cursor.execute("DELETE FROM LienHe WHERE id = ?", (id,))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Xóa liên hệ thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

