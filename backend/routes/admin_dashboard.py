from flask import Blueprint, jsonify
from db import get_db

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)

# =====================================================
# THỐNG KÊ TỔNG QUAN
# =====================================================
@admin_dashboard_bp.route("/thong-ke", methods=["GET"])
def get_thong_ke():
    conn = get_db()
    cursor = conn.cursor()

    # Số người dùng
    cursor.execute("SELECT COUNT(*) FROM NguoiDung WHERE vaiTro = N'khach'")
    soNguoiDung = cursor.fetchone()[0]

    # Số sản phẩm
    cursor.execute("SELECT COUNT(*) FROM SanPham WHERE trangThai = 1")
    soSanPham = cursor.fetchone()[0]

    # Số đơn hàng
    cursor.execute("SELECT COUNT(*) FROM DonHang")
    soDonHang = cursor.fetchone()[0]

    # Tổng doanh thu
    cursor.execute("""
        SELECT SUM(tongTien) 
        FROM DonHang 
        WHERE trangThai IN (N'Đã thanh toán', N'Hoàn thành')
    """)
    tongDoanhThu = cursor.fetchone()[0] or 0

    # Đơn hàng theo trạng thái
    cursor.execute("""
        SELECT trangThai, COUNT(*) 
        FROM DonHang 
        GROUP BY trangThai
    """)
    donHangTheoTrangThai = {}
    for row in cursor.fetchall():
        donHangTheoTrangThai[row[0]] = row[1]

    return jsonify({
        "soNguoiDung": soNguoiDung,
        "soSanPham": soSanPham,
        "soDonHang": soDonHang,
        "tongDoanhThu": float(tongDoanhThu),
        "donHangTheoTrangThai": donHangTheoTrangThai
    })

