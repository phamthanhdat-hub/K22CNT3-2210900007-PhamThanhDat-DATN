from flask import Blueprint, request, jsonify
from db import get_db

admin_don_hang_bp = Blueprint("admin_don_hang", __name__)

# =========================
# 1️⃣ DANH SÁCH ĐƠN HÀNG
# =========================
@admin_don_hang_bp.route("/admin/don-hang", methods=["GET"])
def danh_sach_don_hang():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT dh.id, nd.hoTen, dh.tongTien,
               dh.trangThai, dh.ngayDat
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
        ORDER BY dh.ngayDat DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "donHang_id": r[0],
            "khachHang": r[1],
            "tongTien": float(r[2]),
            "trangThai": r[3],
            "ngayDat": r[4]
        })

    return jsonify(data)


# =========================
# 2️⃣ CHI TIẾT ĐƠN HÀNG
# =========================
@admin_don_hang_bp.route("/admin/don-hang/<int:donHang_id>", methods=["GET"])
def chi_tiet_don_hang(donHang_id):
    conn = get_db()
    cursor = conn.cursor()

    # Thông tin đơn
    cursor.execute("""
        SELECT dh.id, nd.hoTen, nd.email,
               dh.tongTien, dh.trangThai, dh.ngayDat,
               dh.diaChiGiaoHang
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
        WHERE dh.id = ?
    """, (donHang_id,))
    don_hang = cursor.fetchone()

    if not don_hang:
        return jsonify({"message": "Đơn hàng không tồn tại"}), 404

    # Chi tiết sản phẩm
    cursor.execute("""
        SELECT sp.tenSanPham, ctdh.soLuong, ctdh.gia
        FROM ChiTietDonHang ctdh
        JOIN SanPham sp ON ctdh.sanPham_id = sp.id
        WHERE ctdh.donHang_id = ?
    """, (donHang_id,))
    chi_tiet = cursor.fetchall()

    san_pham = []
    for sp in chi_tiet:
        san_pham.append({
            "tenSanPham": sp[0],
            "soLuong": sp[1],
            "gia": float(sp[2]),
            "tamTinh": float(sp[1] * sp[2])
        })

    return jsonify({
        "donHang": {
            "id": don_hang[0],
            "khachHang": don_hang[1],
            "email": don_hang[2],
            "tongTien": float(don_hang[3]),
            "trangThai": don_hang[4],
            "ngayDat": don_hang[5],
            "diaChiGiaoHang": don_hang[6]
        },
        "sanPham": san_pham
    })


# =========================
# 3️⃣ CẬP NHẬT TRẠNG THÁI
# =========================
@admin_don_hang_bp.route("/admin/don-hang/<int:donHang_id>", methods=["PUT"])
def cap_nhat_trang_thai(donHang_id):
    data = request.json
    trangThai = data.get("trangThai")

    if not trangThai:
        return jsonify({"message": "Thiếu trạng thái"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE DonHang
        SET trangThai = ?
        WHERE id = ?
    """, (trangThai, donHang_id))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Cập nhật trạng thái thành công"
    })
