from flask import Blueprint, request, jsonify
from db import get_db

thanh_toan_bp = Blueprint("thanh_toan", __name__)

# =========================
# THANH TOÁN ĐƠN HÀNG
# =========================
@thanh_toan_bp.route("/thanh-toan", methods=["POST"])
def thanh_toan():
    try:
        data = request.json
        donHang_id = data.get("donHang_id")
        phuongThuc = data.get("phuongThuc", "").strip()  # COD | Chuyển khoản

        # Validation
        if not donHang_id:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin đơn hàng"
            }), 400

        if not phuongThuc or phuongThuc not in ["COD", "Chuyển khoản"]:
            return jsonify({
                "success": False,
                "message": "Phương thức thanh toán không hợp lệ. Vui lòng chọn COD hoặc Chuyển khoản"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # 1️⃣ Kiểm tra đơn hàng có tồn tại không
        cursor.execute("""
            SELECT id, nguoiDung_id, tongTien, trangThai
            FROM DonHang
            WHERE id = ?
        """, (donHang_id,))

        don_hang = cursor.fetchone()

        if not don_hang:
            return jsonify({
                "success": False,
                "message": "Đơn hàng không tồn tại"
            }), 404

        # Kiểm tra đơn hàng đã được thanh toán chưa
        cursor.execute("""
            SELECT id, trangThai
            FROM ThanhToan
            WHERE donHang_id = ?
        """, (donHang_id,))

        existing_payment = cursor.fetchone()
        
        if existing_payment:
            return jsonify({
                "success": False,
                "message": f"Đơn hàng này đã được thanh toán (Trạng thái: {existing_payment[1]})"
            }), 400

        # 2️⃣ Ghi thanh toán vào bảng ThanhToan
        # Trạng thái mặc định: "Chờ xác nhận" cho COD, "Đã thanh toán" cho Chuyển khoản
        trangThai = "Chờ xác nhận" if phuongThuc == "COD" else "Đã thanh toán"
        
        cursor.execute("""
            INSERT INTO ThanhToan
            (donHang_id, phuongThuc, trangThai)
            VALUES (?, ?, ?)
        """, (donHang_id, phuongThuc, trangThai))

        # 3️⃣ Cập nhật trạng thái đơn hàng
        don_hang_trang_thai = "Chờ xác nhận" if phuongThuc == "COD" else "Đã thanh toán"
        cursor.execute("""
            UPDATE DonHang
            SET trangThai = ?
            WHERE id = ?
        """, (don_hang_trang_thai, donHang_id))

        # Commit vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Thanh toán thành công",
            "thanhToan": {
                "donHang_id": donHang_id,
                "phuongThuc": phuongThuc,
                "trangThai": trangThai
            }
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
# ADMIN - XEM THANH TOÁN THEO ĐƠN HÀNG
# =====================================================
@thanh_toan_bp.route("/don-hang/<int:donHang_id>", methods=["GET"])
def get_thanh_toan_by_don_hang(donHang_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                tt.id,
                tt.donHang_id,
                tt.phuongThuc,
                tt.trangThai,
                tt.ngayThanhToan,
                dh.nguoiDung_id,
                dh.tongTien,
                nd.hoTen
            FROM ThanhToan tt
            JOIN DonHang dh ON tt.donHang_id = dh.id
            JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
            WHERE tt.donHang_id = ?
        """, (donHang_id,))

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "donHang_id": r[1],
                "phuongThuc": r[2],
                "trangThai": r[3],
                "ngayThanhToan": r[4].isoformat() if r[4] else None,
                "nguoiDung_id": r[5],
                "tongTien": float(r[6]),
                "hoTen": r[7]
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - XEM TẤT CẢ THANH TOÁN
# =====================================================
@thanh_toan_bp.route("/admin", methods=["GET"])
def get_all_thanh_toan():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT 
                tt.id,
                tt.donHang_id,
                tt.phuongThuc,
                tt.trangThai,
                tt.ngayThanhToan,
                dh.nguoiDung_id,
                dh.tongTien,
                dh.diaChiGiaoHang,
                dh.ngayDat,
                nd.hoTen,
                nd.email,
                nd.dienThoai
            FROM ThanhToan tt
            JOIN DonHang dh ON tt.donHang_id = dh.id
            JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
            ORDER BY tt.ngayThanhToan DESC
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "donHang_id": r[1],
                "phuongThuc": r[2],
                "trangThai": r[3],
                "ngayThanhToan": r[4].isoformat() if r[4] else None,
                "nguoiDung_id": r[5],
                "tongTien": float(r[6]),
                "diaChiGiaoHang": r[7],
                "ngayDat": r[8].isoformat() if r[8] else None,
                "hoTen": r[9],
                "email": r[10],
                "dienThoai": r[11]
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# ADMIN - CẬP NHẬT TRẠNG THÁI THANH TOÁN
# =====================================================
@thanh_toan_bp.route("/admin/<int:id>", methods=["PUT"])
def update_thanh_toan(id):
    try:
        data = request.json
        
        if not data or "trangThai" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin trạng thái"
            }), 400

        trangThai = data.get("trangThai", "").strip()
        phuongThuc = data.get("phuongThuc", "").strip()

        if not trangThai:
            return jsonify({
                "success": False,
                "message": "Trạng thái không được để trống"
            }), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra thanh toán có tồn tại không
        cursor.execute("""
            SELECT id, donHang_id
            FROM ThanhToan
            WHERE id = ?
        """, (id,))

        thanh_toan = cursor.fetchone()
        
        if not thanh_toan:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy thanh toán"
            }), 404

        donHang_id = thanh_toan[1]

        # Cập nhật trạng thái thanh toán
        if phuongThuc:
            cursor.execute("""
                UPDATE ThanhToan
                SET trangThai = ?, phuongThuc = ?
                WHERE id = ?
            """, (trangThai, phuongThuc, id))
        else:
            cursor.execute("""
                UPDATE ThanhToan
                SET trangThai = ?
                WHERE id = ?
            """, (trangThai, id))

        # Cập nhật trạng thái đơn hàng tương ứng
        cursor.execute("""
            UPDATE DonHang
            SET trangThai = ?
            WHERE id = ?
        """, (trangThai, donHang_id))

        # Commit vào database
        conn.commit()

        return jsonify({
            "success": True,
            "message": "Cập nhật trạng thái thanh toán thành công"
        })

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500
