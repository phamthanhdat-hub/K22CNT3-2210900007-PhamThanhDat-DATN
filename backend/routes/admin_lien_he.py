from flask import Blueprint, jsonify, request
from db import get_db

admin_lien_he_bp = Blueprint("admin_lien_he", __name__)

def _get_lienhe_columns(cursor):
    """Return set of column names for table LienHe (lowercased)."""
    cursor.execute("""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'LienHe'
    """)
    return {str(r[0]).lower() for r in cursor.fetchall() if r and r[0]}

# =====================================================
# LẤY TẤT CẢ LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("", methods=["GET"])
def get_all_lien_he():
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        cols = _get_lienhe_columns(cursor)
        select_fields = ["id", "hoTen", "email", "noiDung", "ngayGui"]
        if "dienthoai" in cols:
            select_fields.append("dienThoai")
        else:
            select_fields.append("NULL AS dienThoai")

        if "trangthai" in cols:
            select_fields.append("trangThai")
        else:
            select_fields.append("N'Chưa xử lý' AS trangThai")

        cursor.execute(f"""
            SELECT {", ".join(select_fields)}
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
                "ngayGui": r[4].isoformat() if r[4] else None,
                "dienThoai": r[5] if r[5] else None,
                "trangThai": r[6] if r[6] else "Chưa xử lý"
            })

        return jsonify(data)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass

# =====================================================
# TẠO LIÊN HỆ MỚI (ADMIN)
# =====================================================
@admin_lien_he_bp.route("", methods=["POST"])
def create_lien_he():
    conn = None
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
        dienThoai = data.get("dienThoai", "").strip() or None
        trangThai = data.get("trangThai", "Chưa xử lý").strip()
        
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
        cols = _get_lienhe_columns(cursor)

        insert_cols = ["hoTen", "email", "noiDung"]
        insert_vals = [hoTen, email, noiDung]

        if "dienthoai" in cols:
            insert_cols.append("dienThoai")
            insert_vals.append(dienThoai)

        if "trangthai" in cols:
            insert_cols.append("trangThai")
            insert_vals.append(trangThai or "Chưa xử lý")

        placeholders = ", ".join(["?"] * len(insert_cols))
        col_sql = ", ".join(insert_cols)

        cursor.execute(f"""
            INSERT INTO LienHe ({col_sql})
            VALUES ({placeholders})
        """, tuple(insert_vals))

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
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass

# =====================================================
# LẤY CHI TIẾT 1 LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["GET"])
def get_lien_he_by_id(id):
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cols = _get_lienhe_columns(cursor)

        select_fields = ["id", "hoTen", "email", "noiDung", "ngayGui"]
        if "dienthoai" in cols:
            select_fields.append("dienThoai")
        else:
            select_fields.append("NULL AS dienThoai")

        if "trangthai" in cols:
            select_fields.append("trangThai")
        else:
            select_fields.append("N'Chưa xử lý' AS trangThai")

        cursor.execute(f"""
            SELECT {", ".join(select_fields)}
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
                "ngayGui": r[4].isoformat() if r[4] else None,
                "dienThoai": r[5] if r[5] else None,
                "trangThai": r[6] if r[6] else "Chưa xử lý"
            }
        })
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass

# =====================================================
# CẬP NHẬT LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["PUT"])
def update_lien_he(id):
    conn = None
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
        dienThoai = data.get("dienThoai", "").strip() or None
        trangThai = data.get("trangThai", "Chưa xử lý").strip()
        
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
        cols = _get_lienhe_columns(cursor)
        
        # Kiểm tra liên hệ có tồn tại không
        cursor.execute("SELECT id FROM LienHe WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy liên hệ"
            }), 404

        # Update theo schema hiện có
        set_parts = ["hoTen = ?", "email = ?", "noiDung = ?"]
        vals = [hoTen, email, noiDung]

        if "dienthoai" in cols:
            set_parts.append("dienThoai = ?")
            vals.append(dienThoai)

        if "trangthai" in cols:
            set_parts.append("trangThai = ?")
            vals.append(trangThai or "Chưa xử lý")

        vals.append(id)

        cursor.execute(f"""
            UPDATE LienHe
            SET {", ".join(set_parts)}
            WHERE id = ?
        """, tuple(vals))

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
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass

# =====================================================
# XÓA LIÊN HỆ
# =====================================================
@admin_lien_he_bp.route("/<int:id>", methods=["DELETE"])
def delete_lien_he(id):
    conn = None
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
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass

