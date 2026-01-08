from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import lay_user_tu_token

gio_hang_bp = Blueprint("gio_hang", __name__)

# =====================================================
# GET GIỎ HÀNG (THEO TOKEN)
# =====================================================
@gio_hang_bp.route("", methods=["GET"])
def get_gio_hang():
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            gh.id AS gioHang_id,
            sp.id AS sanPham_id,
            sp.tenSanPham,
            sp.gia,
            sp.hinhAnh,
            gh.soLuong
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, (nguoiDung_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "gioHang_id": r[0],
            "sanPham_id": r[1],
            "tenSanPham": r[2],
            "gia": float(r[3]),
            "hinhAnh": r[4],
            "soLuong": r[5]
        })

    return jsonify(data)


# =====================================================
# THÊM VÀO GIỎ
# =====================================================
@gio_hang_bp.route("", methods=["POST"])
def add_to_cart():
    try:
        user = lay_user_tu_token()
        if not user:
            return jsonify({
                "success": False,
                "message": "Vui lòng đăng nhập để thêm vào giỏ hàng"
            }), 401

        nguoiDung_id = user["id"]
        data = request.json
        
        if not data or "sanPham_id" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin sản phẩm"
            }), 400

        sanPham_id = data["sanPham_id"]
        soLuong = data.get("soLuong", 1)

        # Validation số lượng
        if soLuong <= 0:
            return jsonify({
                "success": False,
                "message": "Số lượng phải lớn hơn 0"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra sản phẩm có tồn tại và đang hoạt động không
        cursor.execute("""
            SELECT id, tenSanPham, gia, trangThai
            FROM SanPham
            WHERE id = ?
        """, (sanPham_id,))
        
        sanPham = cursor.fetchone()
        if not sanPham:
            return jsonify({
                "success": False,
                "message": "Sản phẩm không tồn tại"
            }), 404

        if not sanPham[3]:  # trangThai = 0
            return jsonify({
                "success": False,
                "message": "Sản phẩm hiện không khả dụng"
            }), 400

        # Kiểm tra sản phẩm đã có trong giỏ hàng chưa
        cursor.execute("""
            SELECT id, soLuong
            FROM GioHang
            WHERE nguoiDung_id = ? AND sanPham_id = ?
        """, (nguoiDung_id, sanPham_id))

        row = cursor.fetchone()

        if row:
            # Cập nhật số lượng (tăng thêm)
            new_soLuong = row[1] + soLuong
            cursor.execute("""
                UPDATE GioHang
                SET soLuong = ?
                WHERE id = ?
            """, (new_soLuong, row[0]))
        else:
            # Thêm mới vào giỏ hàng
            cursor.execute("""
                INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
                VALUES (?, ?, ?)
            """, (nguoiDung_id, sanPham_id, soLuong))

        # Commit vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Đã thêm vào giỏ hàng thành công"
        })

    except Exception as e:
        # Rollback nếu có lỗi
        if 'conn' in locals():
            conn.rollback()
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# CẬP NHẬT SỐ LƯỢNG
# =====================================================
@gio_hang_bp.route("/<int:id>", methods=["PUT"])
def update_so_luong(id):
    try:
        user = lay_user_tu_token()
        if not user:
            return jsonify({
                "success": False,
                "message": "Vui lòng đăng nhập"
            }), 401

        nguoiDung_id = user["id"]
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

        # Kiểm tra giỏ hàng có tồn tại và thuộc về user này không
        cursor.execute("""
            SELECT id, nguoiDung_id
            FROM GioHang
            WHERE id = ?
        """, (id,))

        gio_hang_item = cursor.fetchone()
        
        if not gio_hang_item:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm trong giỏ hàng"
            }), 404

        # Kiểm tra quyền sở hữu
        if gio_hang_item[1] != nguoiDung_id:
            return jsonify({
                "success": False,
                "message": "Bạn không có quyền cập nhật sản phẩm này"
            }), 403

        # Cập nhật số lượng
        cursor.execute("""
            UPDATE GioHang
            SET soLuong = ?
            WHERE id = ? AND nguoiDung_id = ?
        """, (soLuong, id, nguoiDung_id))

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
# XÓA SẢN PHẨM
# =====================================================
@gio_hang_bp.route("/<int:id>", methods=["DELETE"])
def delete_item(id):
    try:
        user = lay_user_tu_token()
        if not user:
            return jsonify({
                "success": False,
                "message": "Vui lòng đăng nhập"
            }), 401

        nguoiDung_id = user["id"]
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra giỏ hàng có tồn tại và thuộc về user này không
        cursor.execute("""
            SELECT id, nguoiDung_id
            FROM GioHang
            WHERE id = ?
        """, (id,))

        gio_hang_item = cursor.fetchone()
        
        if not gio_hang_item:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy sản phẩm trong giỏ hàng"
            }), 404

        # Kiểm tra quyền sở hữu
        if gio_hang_item[1] != nguoiDung_id:
            return jsonify({
                "success": False,
                "message": "Bạn không có quyền xóa sản phẩm này"
            }), 403

        # Xóa sản phẩm khỏi giỏ hàng
        cursor.execute("""
            DELETE FROM GioHang 
            WHERE id = ? AND nguoiDung_id = ?
        """, (id, nguoiDung_id))

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
