from flask import Blueprint, jsonify, request
from db import get_db

lien_he_bp = Blueprint("lien_he", __name__)

def _get_lienhe_columns(cursor):
    """Return set of column names for table LienHe (lowercased)."""
    cursor.execute("""
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'LienHe'
    """)
    return {str(r[0]).lower() for r in cursor.fetchall() if r and r[0]}

# ===============================
# KHÁCH GỬI LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["POST"])
def gui_lien_he():
    conn = None
    try:
        # Kiểm tra Content-Type
        if not request.is_json:
            return jsonify({
                "success": False,
                "message": "Content-Type phải là application/json"
            }), 400
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu"
            }), 400
        
        hoTen = data.get("hoTen", "").strip()
        email = data.get("email", "").strip()
        noiDung = data.get("noiDung", "").strip()
        dienThoai = data.get("dienThoai", "").strip() or None
        
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
        
        # Kết nối database
        conn = get_db()
        cursor = conn.cursor()

        # Debug (avoid emojis for Windows console compatibility)
        print(f"[LIEN_HE] Attempting to insert: hoTen={hoTen}, email={email}, dienThoai={dienThoai}, noiDung_len={len(noiDung)}")

        # Insert vào bảng LienHe (tự tương thích schema: có/không có dienThoai,trangThai)
        try:
            cols = _get_lienhe_columns(cursor)

            insert_cols = ["hoTen", "email", "noiDung"]
            insert_vals = [hoTen, email, noiDung]

            if "dienthoai" in cols:
                insert_cols.append("dienThoai")
                insert_vals.append(dienThoai)

            if "trangthai" in cols:
                insert_cols.append("trangThai")
                insert_vals.append("Chưa xử lý")

            placeholders = ", ".join(["?"] * len(insert_cols))
            col_sql = ", ".join(insert_cols)

            cursor.execute(f"""
                INSERT INTO LienHe ({col_sql})
                VALUES ({placeholders})
            """, tuple(insert_vals))
            conn.commit()
            print(f"[LIEN_HE] Insert successful. Columns used: {insert_cols}")
        except Exception as db_error:
            print(f"[LIEN_HE] Database error during insert: {str(db_error)}")
            raise
        
        return jsonify({
            "success": True,
            "message": "Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất."
        })
    
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except:
                pass
        error_msg = str(e)
        print(f"[LIEN_HE] Error in gui_lien_he: {error_msg}")  # Debug log
        print(f"[LIEN_HE] Error type: {type(e).__name__}")  # Debug log
        
        # Xử lý các lỗi cụ thể
        if "Invalid object name" in error_msg or "LienHe" in error_msg or "does not exist" in error_msg.lower():
            return jsonify({
                "success": False,
                "message": "Lỗi database: Bảng LienHe không tồn tại. Vui lòng kiểm tra lại CSDL và chạy lại file PTD_SQL.sql."
            }), 500
        elif "Cannot insert" in error_msg or "constraint" in error_msg.lower() or "violation" in error_msg.lower():
            return jsonify({
                "success": False,
                "message": f"Lỗi dữ liệu: {error_msg}"
            }), 400
        elif "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            return jsonify({
                "success": False,
                "message": "Lỗi kết nối database. Vui lòng kiểm tra SQL Server đã chạy chưa."
            }), 500
        else:
            return jsonify({
                "success": False,
                "message": f"Lỗi hệ thống: {error_msg}. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
            }), 500
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass


# ===============================
# ADMIN - XEM LIÊN HỆ
# ===============================
@lien_he_bp.route("/", methods=["GET"])
def get_lien_he():
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
                "hoTen": r[1] or "",
                "email": r[2] or "",
                "noiDung": r[3] or "",
                "ngayGui": r[4].isoformat() if r[4] else None,
                "dienThoai": r[5] if r[5] else None,
                "trangThai": r[6] if r[6] else "Chưa xử lý"
            })

        return jsonify(data)
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error in get_lien_he: {error_msg}")
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {error_msg}"
        }), 500
    finally:
        if conn:
            try:
                cursor.close()
                conn.close()
            except:
                pass