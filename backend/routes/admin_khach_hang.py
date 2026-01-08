from flask import Blueprint, request, jsonify
from db import get_db

admin_khach_hang_bp = Blueprint("admin_khach_hang", __name__)

# =====================================================
# LẤY TẤT CẢ KHÁCH HÀNG
# =====================================================
@admin_khach_hang_bp.route("", methods=["GET"])
def get_all_khach_hang():
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra xem cột diaChiVanPhong có tồn tại không
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'diaChiVanPhong'
        """)
        has_diaChiVanPhong = cursor.fetchone() is not None

        if has_diaChiVanPhong:
            cursor.execute("""
                SELECT 
                    id, hoTen, email, dienThoai, diaChi, diaChiVanPhong,
                    vaiTro, ngayTao, trangThai
                FROM NguoiDung
                WHERE vaiTro = N'khach'
                ORDER BY ngayTao DESC
            """)
        else:
            cursor.execute("""
                SELECT 
                    id, hoTen, email, dienThoai, diaChi,
                    vaiTro, ngayTao, trangThai
                FROM NguoiDung
                WHERE vaiTro = N'khach'
                ORDER BY ngayTao DESC
            """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            # Đếm số đơn hàng của khách hàng
            cursor.execute("SELECT COUNT(*) FROM DonHang WHERE nguoiDung_id = ?", (r[0],))
            soDonHang = cursor.fetchone()[0]

            # Tính tổng tiền đã mua
            cursor.execute("""
                SELECT SUM(tongTien) 
                FROM DonHang 
                WHERE nguoiDung_id = ? AND trangThai IN (N'Đã thanh toán', N'Hoàn thành')
            """, (r[0],))
            tongTien = cursor.fetchone()[0] or 0

            if has_diaChiVanPhong:
                data.append({
                    "id": r[0],
                    "hoTen": r[1],
                    "email": r[2],
                    "dienThoai": r[3],
                    "diaChi": r[4],
                    "diaChiVanPhong": r[5],
                    "vaiTro": r[6],
                    "ngayTao": r[7].isoformat() if r[7] else None,
                    "trangThai": bool(r[8]) if r[8] is not None else True,
                    "soDonHang": soDonHang,
                    "tongTien": float(tongTien)
                })
            else:
                data.append({
                    "id": r[0],
                    "hoTen": r[1],
                    "email": r[2],
                    "dienThoai": r[3],
                    "diaChi": r[4],
                    "diaChiVanPhong": None,
                    "vaiTro": r[5],
                    "ngayTao": r[6].isoformat() if r[6] else None,
                    "trangThai": bool(r[7]) if r[7] is not None else True,
                    "soDonHang": soDonHang,
                    "tongTien": float(tongTien)
                })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# LẤY CHI TIẾT KHÁCH HÀNG
# =====================================================
@admin_khach_hang_bp.route("/<int:id>", methods=["GET"])
def get_khach_hang_by_id(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra xem cột diaChiVanPhong có tồn tại không
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'diaChiVanPhong'
        """)
        has_diaChiVanPhong = cursor.fetchone() is not None

        if has_diaChiVanPhong:
            cursor.execute("""
                SELECT 
                    id, hoTen, email, dienThoai, diaChi, diaChiVanPhong,
                    vaiTro, ngayTao, trangThai
                FROM NguoiDung
                WHERE id = ? AND vaiTro = N'khach'
            """, (id,))
        else:
            cursor.execute("""
                SELECT 
                    id, hoTen, email, dienThoai, diaChi,
                    vaiTro, ngayTao, trangThai
                FROM NguoiDung
                WHERE id = ? AND vaiTro = N'khach'
            """, (id,))

        r = cursor.fetchone()
        if not r:
            return jsonify({"success": False, "message": "Không tìm thấy khách hàng"}), 404

        # Lấy danh sách đơn hàng
        cursor.execute("""
            SELECT id, tongTien, trangThai, ngayDat, diaChiGiaoHang
            FROM DonHang
            WHERE nguoiDung_id = ?
            ORDER BY ngayDat DESC
        """, (id,))

        donHangList = []
        for dh in cursor.fetchall():
            donHangList.append({
                "id": dh[0],
                "tongTien": float(dh[1]),
                "trangThai": dh[2],
                "ngayDat": dh[3].isoformat() if dh[3] else None,
                "diaChiGiaoHang": dh[4]
            })

        if has_diaChiVanPhong:
            return jsonify({
                "id": r[0],
                "hoTen": r[1],
                "email": r[2],
                "dienThoai": r[3],
                "diaChi": r[4],
                "diaChiVanPhong": r[5],
                "vaiTro": r[6],
                "ngayTao": r[7].isoformat() if r[7] else None,
                "trangThai": bool(r[8]) if r[8] is not None else True,
                "donHang": donHangList
            })
        else:
            return jsonify({
                "id": r[0],
                "hoTen": r[1],
                "email": r[2],
                "dienThoai": r[3],
                "diaChi": r[4],
                "diaChiVanPhong": None,
                "vaiTro": r[5],
                "ngayTao": r[6].isoformat() if r[6] else None,
                "trangThai": bool(r[7]) if r[7] is not None else True,
                "donHang": donHangList
            })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# THÊM KHÁCH HÀNG MỚI
# =====================================================
@admin_khach_hang_bp.route("", methods=["POST"])
def create_khach_hang():
    try:
        data = request.json

        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400

        hoTen = data.get("hoTen", "").strip()
        email = data.get("email", "").strip()
        matKhau = data.get("matKhau", "")
        dienThoai = data.get("dienThoai", "").strip() or None
        diaChi = data.get("diaChi", "").strip() or None

        # Validation
        if not hoTen or len(hoTen) < 2:
            return jsonify({"success": False, "message": "Họ và tên phải có ít nhất 2 ký tự"}), 400

        if not email:
            return jsonify({"success": False, "message": "Vui lòng nhập email"}), 400

        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"success": False, "message": "Email không hợp lệ"}), 400

        if not matKhau or len(matKhau) < 6:
            return jsonify({"success": False, "message": "Mật khẩu phải có ít nhất 6 ký tự"}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra email đã tồn tại
        cursor.execute("SELECT id FROM NguoiDung WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Email đã tồn tại"}), 400

        # Kiểm tra xem cột diaChiVanPhong có tồn tại không
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'diaChiVanPhong'
        """)
        has_diaChiVanPhong = cursor.fetchone() is not None

        if has_diaChiVanPhong:
            cursor.execute("""
                INSERT INTO NguoiDung
                (hoTen, email, matKhau, dienThoai, diaChi, diaChiVanPhong, vaiTro, trangThai)
                VALUES (?, ?, ?, ?, ?, ?, N'khach', 1)
            """, (hoTen, email, matKhau, dienThoai, diaChi, None))
        else:
            cursor.execute("""
                INSERT INTO NguoiDung
                (hoTen, email, matKhau, dienThoai, diaChi, vaiTro, trangThai)
                VALUES (?, ?, ?, ?, ?, N'khach', 1)
            """, (hoTen, email, matKhau, dienThoai, diaChi))

        conn.commit()
        return jsonify({"success": True, "message": "Thêm khách hàng thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# CẬP NHẬT KHÁCH HÀNG
# =====================================================
@admin_khach_hang_bp.route("/<int:id>", methods=["PUT"])
def update_khach_hang(id):
    try:
        data = request.json

        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400

        hoTen = data.get("hoTen", "").strip()
        email = data.get("email", "").strip()
        matKhau = data.get("matKhau", "").strip()
        dienThoai = data.get("dienThoai", "").strip() or None
        diaChi = data.get("diaChi", "").strip() or None
        trangThai = data.get("trangThai", True)

        # Validation
        if not hoTen or len(hoTen) < 2:
            return jsonify({"success": False, "message": "Họ và tên phải có ít nhất 2 ký tự"}), 400

        if not email:
            return jsonify({"success": False, "message": "Vui lòng nhập email"}), 400

        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"success": False, "message": "Email không hợp lệ"}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra khách hàng có tồn tại không
        cursor.execute("SELECT id, email FROM NguoiDung WHERE id = ? AND vaiTro = N'khach'", (id,))
        existing = cursor.fetchone()
        if not existing:
            return jsonify({"success": False, "message": "Không tìm thấy khách hàng"}), 404

        # Kiểm tra email đã tồn tại (trừ chính nó)
        if email != existing[1]:
            cursor.execute("SELECT id FROM NguoiDung WHERE email = ? AND id != ?", (email, id))
            if cursor.fetchone():
                return jsonify({"success": False, "message": "Email đã tồn tại"}), 400

        # Kiểm tra xem cột diaChiVanPhong có tồn tại không
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'NguoiDung' AND COLUMN_NAME = 'diaChiVanPhong'
        """)
        has_diaChiVanPhong = cursor.fetchone() is not None

        # Cập nhật thông tin
        if matKhau and len(matKhau) >= 6:
            # Cập nhật cả mật khẩu
            if has_diaChiVanPhong:
                cursor.execute("""
                    UPDATE NguoiDung
                    SET hoTen = ?, email = ?, matKhau = ?, dienThoai = ?, diaChi = ?, trangThai = ?
                    WHERE id = ?
                """, (hoTen, email, matKhau, dienThoai, diaChi, 1 if trangThai else 0, id))
            else:
                cursor.execute("""
                    UPDATE NguoiDung
                    SET hoTen = ?, email = ?, matKhau = ?, dienThoai = ?, diaChi = ?, trangThai = ?
                    WHERE id = ?
                """, (hoTen, email, matKhau, dienThoai, diaChi, 1 if trangThai else 0, id))
        else:
            # Không cập nhật mật khẩu
            if has_diaChiVanPhong:
                cursor.execute("""
                    UPDATE NguoiDung
                    SET hoTen = ?, email = ?, dienThoai = ?, diaChi = ?, trangThai = ?
                    WHERE id = ?
                """, (hoTen, email, dienThoai, diaChi, 1 if trangThai else 0, id))
            else:
                cursor.execute("""
                    UPDATE NguoiDung
                    SET hoTen = ?, email = ?, dienThoai = ?, diaChi = ?, trangThai = ?
                    WHERE id = ?
                """, (hoTen, email, dienThoai, diaChi, 1 if trangThai else 0, id))

        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật khách hàng thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# XÓA KHÁCH HÀNG (SOFT DELETE)
# =====================================================
@admin_khach_hang_bp.route("/<int:id>", methods=["DELETE"])
def delete_khach_hang(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra khách hàng có tồn tại không
        cursor.execute("SELECT id FROM NguoiDung WHERE id = ? AND vaiTro = N'khach'", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Không tìm thấy khách hàng"}), 404

        # Kiểm tra có đơn hàng không
        cursor.execute("SELECT COUNT(*) FROM DonHang WHERE nguoiDung_id = ?", (id,))
        count = cursor.fetchone()[0]
        if count > 0:
            return jsonify({
                "success": False,
                "message": f"Không thể xóa khách hàng này vì đang có {count} đơn hàng"
            }), 400

        # Soft delete: set trangThai = 0
        cursor.execute("""
            UPDATE NguoiDung
            SET trangThai = 0
            WHERE id = ?
        """, (id,))

        conn.commit()
        return jsonify({"success": True, "message": "Xóa khách hàng thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# CẬP NHẬT TRẠNG THÁI KHÁCH HÀNG
# =====================================================
@admin_khach_hang_bp.route("/<int:id>/trang-thai", methods=["PUT"])
def update_trang_thai(id):
    try:
        data = request.json
        trangThai = data.get("trangThai", True)

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra khách hàng có tồn tại không
        cursor.execute("SELECT id FROM NguoiDung WHERE id = ? AND vaiTro = N'khach'", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Không tìm thấy khách hàng"}), 404

        cursor.execute("""
            UPDATE NguoiDung
            SET trangThai = ?
            WHERE id = ?
        """, (1 if trangThai else 0, id))

        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật trạng thái thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500

