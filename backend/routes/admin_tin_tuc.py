from flask import Blueprint, jsonify, request
from db import get_db
from utils.jwt_helper import lay_user_tu_token

admin_tin_tuc_bp = Blueprint("admin_tin_tuc", __name__)

# =====================================================
# LẤY TẤT CẢ TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("", methods=["GET"])
def get_all_tin_tuc():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh,
            tt.ngayDang, nd.hoTen, tt.nguoiDung_id,
            tt.tomTat, tt.luotXem, tt.trangThai
        FROM TinTuc tt
        LEFT JOIN NguoiDung nd ON tt.nguoiDung_id = nd.id
        ORDER BY tt.ngayDang DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tieuDe": r[1],
            "noiDung": r[2],
            "hinhAnh": r[3],
            "ngayDang": r[4].isoformat() if r[4] else None,
            "nguoiDang": r[5],
            "nguoiDung_id": r[6],
            "tomTat": r[7],
            "luotXem": r[8] if r[8] else 0,
            "trangThai": bool(r[9]) if r[9] is not None else True
        })

    return jsonify(data)

# =====================================================
# TẠO TIN TỨC MỚI
# =====================================================
@admin_tin_tuc_bp.route("", methods=["POST"])
def create_tin_tuc():
    try:
        # Lấy thông tin admin từ token
        admin = lay_user_tu_token()
        if not admin:
            return jsonify({
                "success": False,
                "message": "Chưa đăng nhập hoặc không có quyền"
            }), 401
        
        data = request.json
        
        if not data or not data.get("tieuDe"):
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập tiêu đề"
            }), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO TinTuc (tieuDe, noiDung, hinhAnh, nguoiDung_id, tomTat, luotXem, trangThai)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["tieuDe"],
            data.get("noiDung", ""),
            data.get("hinhAnh"),
            admin["id"],
            data.get("tomTat", "").strip() or None,
            data.get("luotXem", 0),
            data.get("trangThai", 1)
        ))
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Thêm tin tức thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# LẤY CHI TIẾT 1 TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("/<int:id>", methods=["GET"])
def get_tin_tuc_by_id(id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh,
            tt.ngayDang, nd.hoTen, tt.nguoiDung_id,
            tt.tomTat, tt.luotXem, tt.trangThai
        FROM TinTuc tt
        LEFT JOIN NguoiDung nd ON tt.nguoiDung_id = nd.id
        WHERE tt.id = ?
    """, (id,))
    
    r = cursor.fetchone()
    if not r:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy tin tức"
        }), 404
    
    return jsonify({
        "success": True,
        "data": {
            "id": r[0],
            "tieuDe": r[1],
            "noiDung": r[2],
            "hinhAnh": r[3],
            "ngayDang": r[4].isoformat() if r[4] else None,
            "nguoiDang": r[5],
            "nguoiDung_id": r[6],
            "tomTat": r[7],
            "luotXem": r[8] if r[8] else 0,
            "trangThai": bool(r[9]) if r[9] is not None else True
        }
    })

# =====================================================
# CẬP NHẬT TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("/<int:id>", methods=["PUT"])
def update_tin_tuc(id):
    try:
        data = request.json
        
        if not data or not data.get("tieuDe"):
            return jsonify({
                "success": False,
                "message": "Vui lòng nhập tiêu đề"
            }), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra tin tức có tồn tại không
        cursor.execute("SELECT id FROM TinTuc WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy tin tức"
            }), 404

        cursor.execute("""
            UPDATE TinTuc
            SET tieuDe = ?, noiDung = ?, hinhAnh = ?, tomTat = ?, trangThai = ?
            WHERE id = ?
        """, (
            data["tieuDe"],
            data.get("noiDung", ""),
            data.get("hinhAnh"),
            data.get("tomTat", "").strip() or None,
            data.get("trangThai", 1),
            id
        ))

        conn.commit()
        return jsonify({
            "success": True,
            "message": "Cập nhật tin tức thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# XÓA TIN TỨC
# =====================================================
@admin_tin_tuc_bp.route("/<int:id>", methods=["DELETE"])
def delete_tin_tuc(id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra tin tức có tồn tại không
        cursor.execute("SELECT id FROM TinTuc WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy tin tức"
            }), 404

        cursor.execute("DELETE FROM TinTuc WHERE id = ?", (id,))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Xóa tin tức thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

