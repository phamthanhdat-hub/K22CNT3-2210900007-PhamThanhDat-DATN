from flask import Blueprint, jsonify, request
from db import get_db

tin_tuc_bp = Blueprint("tin_tuc", __name__)

# ===============================
# LẤY DANH SÁCH TIN TỨC (CLIENT)
# ===============================
@tin_tuc_bp.route("/", methods=["GET"])
def get_all_tin_tuc():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh,
                tt.ngayDang, nd.hoTen
            FROM TinTuc tt
            LEFT JOIN NguoiDung nd ON tt.nguoiDung_id = nd.id
            ORDER BY tt.ngayDang DESC
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "tieuDe": r[1] if r[1] else "",
                "noiDung": r[2] if r[2] else "",
                "hinhAnh": r[3] if r[3] else None,
                "ngayDang": r[4].isoformat() if r[4] else None,
                "nguoiDang": r[5] if r[5] else "Admin"
            })

        return jsonify(data)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# ===============================
# ADMIN - THÊM TIN TỨC
# ===============================
@tin_tuc_bp.route("/", methods=["POST"])
def create_tin_tuc():
    try:
        data = request.json
        
        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400
        
        tieuDe = data.get("tieuDe", "").strip()
        if not tieuDe:
            return jsonify({"success": False, "message": "Vui lòng nhập tiêu đề"}), 400
        
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO TinTuc (tieuDe, noiDung, hinhAnh, nguoiDung_id)
            VALUES (?, ?, ?, ?)
        """, (
            tieuDe,
            data.get("noiDung", ""),
            data.get("hinhAnh"),
            data.get("nguoiDung_id")
        ))

        conn.commit()
        return jsonify({"success": True, "message": "Thêm tin tức thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
