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
# ADMIN - CẬP NHẬT GIỎ HÀNG (SỐ LƯỢNG HOẶC SẢN PHẨM)
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
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra giỏ hàng có tồn tại không
        cursor.execute("""
            SELECT id, sanPham_id, nguoiDung_id
            FROM GioHang
            WHERE id = ?
        """, (id,))

        gio_hang_item = cursor.fetchone()
        
        if not gio_hang_item:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm trong giỏ hàng"
            }), 404

        # Cập nhật số lượng nếu có
        if "soLuong" in data:
            soLuong = int(data["soLuong"])
            
            if soLuong <= 0:
                return jsonify({
                    "success": False,
                    "message": "Số lượng phải lớn hơn 0"
                }), 400

            cursor.execute("""
                UPDATE GioHang
                SET soLuong = ?
                WHERE id = ?
            """, (soLuong, id))
        
        # Cập nhật sản phẩm nếu có
        if "sanPham_id" in data:
            sanPham_id = int(data["sanPham_id"])
            
            # Kiểm tra sản phẩm có tồn tại và đang hoạt động không
            cursor.execute("""
                SELECT id, trangThai
                FROM SanPham
                WHERE id = ?
            """, (sanPham_id,))
            
            sanPham = cursor.fetchone()
            if not sanPham:
                return jsonify({
                    "success": False,
                    "message": "Sản phẩm không tồn tại"
                }), 404

            if not sanPham[1]:  # trangThai = 0
                return jsonify({
                    "success": False,
                    "message": "Sản phẩm hiện không khả dụng"
                }), 400

            # Kiểm tra sản phẩm đã có trong giỏ hàng của user này chưa (trừ item hiện tại)
            cursor.execute("""
                SELECT id
                FROM GioHang
                WHERE nguoiDung_id = ? AND sanPham_id = ? AND id != ?
            """, (gio_hang_item[2], sanPham_id, id))
            
            if cursor.fetchone():
                return jsonify({
                    "success": False,
                    "message": "Sản phẩm đã có trong giỏ hàng của khách hàng này"
                }), 400

            cursor.execute("""
                UPDATE GioHang
                SET sanPham_id = ?
                WHERE id = ?
            """, (sanPham_id, id))

        # Commit vào database
        conn.commit()

        # Kiểm tra có cập nhật gì không
        if "soLuong" not in data and "sanPham_id" not in data:
            return jsonify({
                "success": False,
                "message": "Vui lòng cung cấp thông tin cần cập nhật (số lượng hoặc sản phẩm)"
            }), 400

        # Tạo message phù hợp
        messages = []
        if "soLuong" in data:
            messages.append("số lượng")
        if "sanPham_id" in data:
            messages.append("sản phẩm")
        message = f"Cập nhật {', '.join(messages)} thành công"

        return jsonify({
            "success": True,
            "message": message
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

