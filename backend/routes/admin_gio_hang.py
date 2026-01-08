from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import lay_user_tu_token

admin_gio_hang_bp = Blueprint("admin_gio_hang", __name__)

# =====================================================
# ADMIN - XEM TẤT CẢ GIỎ HÀNG CỦA TẤT CẢ NGƯỜI DÙNG
# =====================================================
@admin_gio_hang_bp.route("", methods=["GET"])
def get_all_gio_hang():
    try:
        # Kiểm tra quyền admin
        user = lay_user_tu_token()
        if not user or user.get("vaiTro") != "admin":
            return jsonify({
                "success": False,
                "message": "Không có quyền truy cập"
            }), 403

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                gh.id,
                gh.nguoiDung_id,
                gh.sanPham_id,
                gh.soLuong,
                sp.tenSanPham,
                sp.gia,
                sp.hinhAnh,
                nd.hoTen,
                nd.email,
                nd.dienThoai
            FROM GioHang gh
            JOIN SanPham sp ON gh.sanPham_id = sp.id
            JOIN NguoiDung nd ON gh.nguoiDung_id = nd.id
            ORDER BY gh.id DESC
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "nguoiDung_id": r[1],
                "sanPham_id": r[2],
                "soLuong": r[3],
                "tenSanPham": r[4],
                "gia": float(r[5]),
                "hinhAnh": r[6],
                "hoTen": r[7],
                "email": r[8],
                "dienThoai": r[9]
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - XEM GIỎ HÀNG CỦA 1 NGƯỜI DÙNG
# =====================================================
@admin_gio_hang_bp.route("/nguoi-dung/<int:nguoiDung_id>", methods=["GET"])
def get_gio_hang_by_user(nguoiDung_id):
    try:
        # Kiểm tra quyền admin
        user = lay_user_tu_token()
        if not user or user.get("vaiTro") != "admin":
            return jsonify({
                "success": False,
                "message": "Không có quyền truy cập"
            }), 403

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                gh.id,
                gh.sanPham_id,
                gh.soLuong,
                sp.tenSanPham,
                sp.gia,
                sp.hinhAnh
            FROM GioHang gh
            JOIN SanPham sp ON gh.sanPham_id = sp.id
            WHERE gh.nguoiDung_id = ?
        """, (nguoiDung_id,))

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "sanPham_id": r[1],
                "soLuong": r[2],
                "tenSanPham": r[3],
                "gia": float(r[4]),
                "hinhAnh": r[5]
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG
# =====================================================
@admin_gio_hang_bp.route("/<int:id>", methods=["PUT"])
def update_gio_hang(id):
    try:
        # Kiểm tra quyền admin
        user = lay_user_tu_token()
        if not user or user.get("vaiTro") != "admin":
            return jsonify({
                "success": False,
                "message": "Không có quyền truy cập"
            }), 403

        data = request.json
        
        if not data or "soLuong" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin số lượng"
            }), 400

        soLuong = int(data["soLuong"])

        # Validation số lượng
        if soLuong <= 0:
            return jsonify({
                "success": False,
                "message": "Số lượng phải lớn hơn 0"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra giỏ hàng có tồn tại không
        cursor.execute("""
            SELECT id
            FROM GioHang
            WHERE id = ?
        """, (id,))

        gio_hang_item = cursor.fetchone()
        
        if not gio_hang_item:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm trong giỏ hàng"
            }), 404

        # Cập nhật số lượng
        cursor.execute("""
            UPDATE GioHang
            SET soLuong = ?
            WHERE id = ?
        """, (soLuong, id))

        # Commit vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Cập nhật số lượng thành công"
        })

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Số lượng không hợp lệ"
        }), 400
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - XÓA SẢN PHẨM KHỎI GIỎ HÀNG
# =====================================================
@admin_gio_hang_bp.route("/<int:id>", methods=["DELETE"])
def delete_gio_hang(id):
    try:
        # Kiểm tra quyền admin
        user = lay_user_tu_token()
        if not user or user.get("vaiTro") != "admin":
            return jsonify({
                "success": False,
                "message": "Không có quyền truy cập"
            }), 403

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra giỏ hàng có tồn tại không
        cursor.execute("""
            SELECT id
            FROM GioHang
            WHERE id = ?
        """, (id,))

        gio_hang_item = cursor.fetchone()
        
        if not gio_hang_item:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm trong giỏ hàng"
            }), 404

        # Xóa sản phẩm khỏi giỏ hàng
        cursor.execute("""
            DELETE FROM GioHang 
            WHERE id = ?
        """, (id,))

        # Commit vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Đã xóa sản phẩm khỏi giỏ hàng"
        })

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

