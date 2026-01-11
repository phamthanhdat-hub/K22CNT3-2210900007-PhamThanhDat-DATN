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
# ADMIN - LẤY CHI TIẾT GIỎ HÀNG (CHO SỬA)
# =====================================================
@admin_gio_hang_bp.route("/<int:id>", methods=["GET"])
def get_gio_hang_by_id(id):
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
                gh.soLuong
            FROM GioHang gh
            WHERE gh.id = ?
        """, (id,))

        row = cursor.fetchone()
        
        if not row:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy giỏ hàng"
            }), 404

        data = {
            "id": row[0],
            "nguoiDung_id": row[1],
            "sanPham_id": row[2],
            "soLuong": row[3]
        }

        return jsonify({
            "success": True,
            "data": data
        })

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


# =====================================================
# ADMIN - LẤY DANH SÁCH KHÁCH HÀNG (CHO DROPDOWN)
# =====================================================
@admin_gio_hang_bp.route("/khach-hang", methods=["GET"])
def get_khach_hang_list():
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
            SELECT id, hoTen, email, dienThoai
            FROM NguoiDung
            WHERE vaiTro = N'khach'
            ORDER BY hoTen
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "hoTen": r[1] or "Không tên",
                "email": r[2] or "Không có email",
                "dienThoai": r[3] or "Không có"
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - LẤY DANH SÁCH SẢN PHẨM (CHO DROPDOWN)
# =====================================================
@admin_gio_hang_bp.route("/san-pham", methods=["GET"])
def get_san_pham_list():
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
            SELECT id, tenSanPham, gia, hinhAnh, trangThai
            FROM SanPham
            ORDER BY tenSanPham
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "tenSanPham": r[1] or "Không tên",
                "gia": float(r[2]) if r[2] else 0,
                "hinhAnh": r[3] or "",
                "trangThai": r[4] if r[4] is not None else 1
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500




# =====================================================
# ADMIN - THÊM SẢN PHẨM VÀO GIỎ HÀNG
# =====================================================
@admin_gio_hang_bp.route("", methods=["POST"])
def create_gio_hang():
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

        nguoiDung_id = data.get("nguoiDung_id")
        sanPham_id = data.get("sanPham_id")
        soLuong = data.get("soLuong", 1)

        # Validation
        if not nguoiDung_id:
            return jsonify({
                "success": False,
                "message": "Vui lòng chọn khách hàng"
            }), 400

        if not sanPham_id:
            return jsonify({
                "success": False,
                "message": "Vui lòng chọn sản phẩm"
            }), 400

        if not soLuong or soLuong <= 0:
            return jsonify({
                "success": False,
                "message": "Số lượng phải lớn hơn 0"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra khách hàng có tồn tại không
        cursor.execute("""
            SELECT id FROM NguoiDung WHERE id = ? AND vaiTro = N'khach'
        """, (nguoiDung_id,))
        
        if not cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Khách hàng không tồn tại"
            }), 404

        # Kiểm tra sản phẩm có tồn tại và đang hoạt động không
        cursor.execute("""
            SELECT id, trangThai FROM SanPham WHERE id = ?
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

        # Kiểm tra sản phẩm đã có trong giỏ hàng của user này chưa
        cursor.execute("""
            SELECT id, soLuong FROM GioHang
            WHERE nguoiDung_id = ? AND sanPham_id = ?
        """, (nguoiDung_id, sanPham_id))
        
        existing = cursor.fetchone()
        
        if existing:
            # Nếu đã có, cập nhật số lượng
            new_soLuong = existing[1] + soLuong
            cursor.execute("""
                UPDATE GioHang SET soLuong = ? WHERE id = ?
            """, (new_soLuong, existing[0]))
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": f"Cập nhật số lượng thành {new_soLuong}"
            })
        else:
            # Nếu chưa có, thêm mới
            cursor.execute("""
                INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
                VALUES (?, ?, ?)
            """, (nguoiDung_id, sanPham_id, soLuong))
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": "Thêm vào giỏ hàng thành công"
            })

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Dữ liệu không hợp lệ"
        }), 400
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500

