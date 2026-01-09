from flask import Blueprint, jsonify, request
from db import get_db

admin_danh_gia_bp = Blueprint("admin_danh_gia", __name__)

# =====================================================
# LẤY TẤT CẢ ĐÁNH GIÁ
# =====================================================
@admin_danh_gia_bp.route("", methods=["GET"])
def get_all_danh_gia():
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Lấy query parameters cho filter
        sanPham_id = request.args.get("sanPham_id", type=int)
        soSao = request.args.get("soSao", type=int)
        nguoiDung_id = request.args.get("nguoiDung_id", type=int)

        # Build query với filters
        query = """
            SELECT 
                dg.id,
                dg.nguoiDung_id,
                nd.hoTen,
                nd.email,
                dg.sanPham_id,
                sp.tenSanPham,
                sp.hinhAnh,
                dg.soSao,
                dg.noiDung,
                dg.ngayDanhGia
            FROM DanhGia dg
            JOIN NguoiDung nd ON dg.nguoiDung_id = nd.id
            JOIN SanPham sp ON dg.sanPham_id = sp.id
            WHERE 1=1
        """
        params = []

        if sanPham_id:
            query += " AND dg.sanPham_id = ?"
            params.append(sanPham_id)
        
        if soSao:
            query += " AND dg.soSao = ?"
            params.append(soSao)
        
        if nguoiDung_id:
            query += " AND dg.nguoiDung_id = ?"
            params.append(nguoiDung_id)

        query += " ORDER BY dg.ngayDanhGia DESC"

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "nguoiDung_id": r[1],
                "hoTen": r[2],
                "email": r[3],
                "sanPham_id": r[4],
                "tenSanPham": r[5],
                "hinhAnh": r[6],
                "soSao": r[7],
                "noiDung": r[8] if r[8] else "",
                "ngayDanhGia": r[9].isoformat() if r[9] else None
            })

        return jsonify(data)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# LẤY CHI TIẾT ĐÁNH GIÁ
# =====================================================
@admin_danh_gia_bp.route("/<int:id>", methods=["GET"])
def get_danh_gia_by_id(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                dg.id,
                dg.nguoiDung_id,
                nd.hoTen,
                nd.email,
                dg.sanPham_id,
                sp.tenSanPham,
                sp.hinhAnh,
                sp.gia,
                dg.soSao,
                dg.noiDung,
                dg.ngayDanhGia
            FROM DanhGia dg
            JOIN NguoiDung nd ON dg.nguoiDung_id = nd.id
            JOIN SanPham sp ON dg.sanPham_id = sp.id
            WHERE dg.id = ?
        """, (id,))

        r = cursor.fetchone()
        if not r:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy đánh giá"
            }), 404

        return jsonify({
            "success": True,
            "data": {
                "id": r[0],
                "nguoiDung_id": r[1],
                "hoTen": r[2],
                "email": r[3],
                "sanPham_id": r[4],
                "tenSanPham": r[5],
                "hinhAnh": r[6],
                "gia": float(r[7]) if r[7] else 0,
                "soSao": r[8],
                "noiDung": r[9] if r[9] else "",
                "ngayDanhGia": r[10].isoformat() if r[10] else None
            }
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

# =====================================================
# XÓA ĐÁNH GIÁ
# =====================================================
@admin_danh_gia_bp.route("/<int:id>", methods=["DELETE"])
def delete_danh_gia(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra đánh giá có tồn tại không
        cursor.execute("SELECT id FROM DanhGia WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Không tìm thấy đánh giá"
            }), 404

        cursor.execute("DELETE FROM DanhGia WHERE id = ?", (id,))
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Xóa đánh giá thành công"
        })
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500



