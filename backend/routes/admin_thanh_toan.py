from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import lay_user_tu_token

admin_thanh_toan_bp = Blueprint("admin_thanh_toan", __name__)

# =====================================================
# ADMIN - XEM TẤT CẢ THANH TOÁN
# =====================================================
@admin_thanh_toan_bp.route("", methods=["GET"])
def get_all_thanh_toan():
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
                tt.id,
                tt.donHang_id,
                tt.phuongThuc,
                tt.trangThai,
                tt.ngayThanhToan,
                tt.soPhieuThu,
                tt.filePhieuThu,
                dh.nguoiDung_id,
                dh.tongTien,
                dh.diaChiGiaoHang,
                dh.ngayDat,
                dh.trangThai AS donHangTrangThai,
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
                "soPhieuThu": r[5],
                "filePhieuThu": r[6],
                "nguoiDung_id": r[7],
                "tongTien": float(r[8]),
                "diaChiGiaoHang": r[9],
                "ngayDat": r[10].isoformat() if r[10] else None,
                "donHangTrangThai": r[11],
                "hoTen": r[12],
                "email": r[13],
                "dienThoai": r[14]
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
@admin_thanh_toan_bp.route("/<int:id>", methods=["PUT"])
def update_thanh_toan(id):
    try:
        # Kiểm tra quyền admin
        user = lay_user_tu_token()
        if not user or user.get("vaiTro") != "admin":
            return jsonify({
                "success": False,
                "message": "Không có quyền truy cập"
            }), 403

        data = request.json
        
        if not data or "trangThai" not in data:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin trạng thái"
            }), 400

        trangThai = data.get("trangThai", "").strip()
        phuongThuc = data.get("phuongThuc", "").strip()
        soPhieuThu = data.get("soPhieuThu", "").strip() or None
        filePhieuThu = data.get("filePhieuThu", "").strip() or None

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
                SET trangThai = ?, phuongThuc = ?, soPhieuThu = ?, filePhieuThu = ?
                WHERE id = ?
            """, (trangThai, phuongThuc, soPhieuThu, filePhieuThu, id))
        else:
            cursor.execute("""
                UPDATE ThanhToan
                SET trangThai = ?, soPhieuThu = ?, filePhieuThu = ?
                WHERE id = ?
            """, (trangThai, soPhieuThu, filePhieuThu, id))

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


# =====================================================
# ADMIN - XEM CHI TIẾT THANH TOÁN
# =====================================================
@admin_thanh_toan_bp.route("/<int:id>", methods=["GET"])
def get_thanh_toan_by_id(id):
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
                tt.id,
                tt.donHang_id,
                tt.phuongThuc,
                tt.trangThai,
                tt.ngayThanhToan,
                tt.soPhieuThu,
                tt.filePhieuThu,
                dh.nguoiDung_id,
                dh.tongTien,
                dh.diaChiGiaoHang,
                dh.ngayDat,
                dh.trangThai AS donHangTrangThai,
                nd.hoTen,
                nd.email,
                nd.dienThoai,
                nd.diaChi
            FROM ThanhToan tt
            JOIN DonHang dh ON tt.donHang_id = dh.id
            JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
            WHERE tt.id = ?
        """, (id,))

        r = cursor.fetchone()
        
        if not r:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy thanh toán"
            }), 404

        return jsonify({
            "id": r[0],
            "donHang_id": r[1],
            "phuongThuc": r[2],
            "trangThai": r[3],
            "ngayThanhToan": r[4].isoformat() if r[4] else None,
            "soPhieuThu": r[5],
            "filePhieuThu": r[6],
            "nguoiDung_id": r[7],
            "tongTien": float(r[8]),
            "diaChiGiaoHang": r[9],
            "ngayDat": r[10].isoformat() if r[10] else None,
            "donHangTrangThai": r[11],
            "hoTen": r[12],
            "email": r[13],
            "dienThoai": r[14],
            "diaChi": r[15]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500





