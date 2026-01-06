from flask import Blueprint, jsonify, request
from db import get_db

admin_don_hang_bp = Blueprint("admin_don_hang", __name__)

# =====================================================
# 1️⃣ ADMIN – LẤY TẤT CẢ ĐƠN HÀNG
# =====================================================
@admin_don_hang_bp.route("", methods=["GET"])
def get_all_don_hang():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dh.id,
            nd.hoTen,
            nd.dienThoai,
            dh.tongTien,
            dh.trangThai,
            dh.ngayDat,
            dh.diaChiGiaoHang
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
        ORDER BY dh.ngayDat DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "hoTen": r[1],
            "dienThoai": r[2],
            "tongTien": float(r[3]),
            "trangThai": r[4],
            "ngayDat": r[5],
            "diaChiGiaoHang": r[6]
        })

    return jsonify(data)


# =====================================================
# 2️⃣ ADMIN – XEM CHI TIẾT ĐƠN HÀNG
# =====================================================
@admin_don_hang_bp.route("/<int:donHang_id>", methods=["GET"])
def get_chi_tiet_don_hang(donHang_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dh.id, nd.hoTen, nd.dienThoai,
            dh.tongTien, dh.trangThai,
            dh.ngayDat, dh.diaChiGiaoHang
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
        WHERE dh.id = ?
    """, (donHang_id,))
    dh = cursor.fetchone()

    if not dh:
        return jsonify({"message": "Không tìm thấy đơn hàng"}), 404

    cursor.execute("""
        SELECT 
            sp.tenSanPham,
            ctdh.soLuong,
            ctdh.gia
        FROM ChiTietDonHang ctdh
        JOIN SanPham sp ON ctdh.sanPham_id = sp.id
        WHERE ctdh.donHang_id = ?
    """, (donHang_id,))
    items = cursor.fetchall()

    sanPham = []
    for i in items:
        sanPham.append({
            "tenSanPham": i[0],
            "soLuong": i[1],
            "gia": float(i[2])
        })

    return jsonify({
        "donHang": {
            "id": dh[0],
            "hoTen": dh[1],
            "dienThoai": dh[2],
            "tongTien": float(dh[3]),
            "trangThai": dh[4],
            "ngayDat": dh[5],
            "diaChiGiaoHang": dh[6]
        },
        "sanPham": sanPham
    })


# =====================================================
# 3️⃣ ADMIN – CẬP NHẬT TRẠNG THÁI
# =====================================================
@admin_don_hang_bp.route("/<int:id>/trang-thai", methods=["PUT"])
def cap_nhat_trang_thai(id):
    data = request.json
    trangThai = data["trangThai"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE DonHang
        SET trangThai = ?
        WHERE id = ?
    """, (trangThai, id))

    conn.commit()
    return jsonify({"success": True})
