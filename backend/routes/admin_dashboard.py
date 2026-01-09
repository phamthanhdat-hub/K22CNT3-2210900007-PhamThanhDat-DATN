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

    # Số đơn hàng tổng
    cursor.execute("SELECT COUNT(*) FROM DonHang")
    soDonHang = cursor.fetchone()[0]

    # Số đơn hàng hôm nay
    cursor.execute("""
        SELECT COUNT(*) 
        FROM DonHang 
        WHERE CAST(ngayDat AS DATE) = CAST(GETDATE() AS DATE)
    """)
    soDonHangNgay = cursor.fetchone()[0]

    # Số đơn hàng tháng này
    cursor.execute("""
        SELECT COUNT(*) 
        FROM DonHang 
        WHERE YEAR(ngayDat) = YEAR(GETDATE())
        AND MONTH(ngayDat) = MONTH(GETDATE())
    """)
    soDonHangThang = cursor.fetchone()[0]

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

    # Doanh thu hôm nay
    cursor.execute("""
        SELECT SUM(tongTien) 
        FROM DonHang 
        WHERE trangThai IN (N'Đã thanh toán', N'Hoàn thành')
        AND CAST(ngayDat AS DATE) = CAST(GETDATE() AS DATE)
    """)
    doanhThuNgay = cursor.fetchone()[0] or 0

    # Doanh thu tháng này
    cursor.execute("""
        SELECT SUM(tongTien) 
        FROM DonHang 
        WHERE trangThai IN (N'Đã thanh toán', N'Hoàn thành')
        AND YEAR(ngayDat) = YEAR(GETDATE())
        AND MONTH(ngayDat) = MONTH(GETDATE())
    """)
    doanhThuThang = cursor.fetchone()[0] or 0

    return jsonify({
        "soNguoiDung": soNguoiDung,
        "soSanPham": soSanPham,
        "soDonHang": soDonHang,
        "soDonHangNgay": soDonHangNgay,
        "soDonHangThang": soDonHangThang,
        "tongDoanhThu": float(tongDoanhThu),
        "doanhThuNgay": float(doanhThuNgay),
        "doanhThuThang": float(doanhThuThang),
        "donHangTheoTrangThai": donHangTheoTrangThai
    })



