from flask import Blueprint, jsonify, request
from db import get_db

don_hang_bp = Blueprint("don_hang_bp", __name__)

# =====================================================
# KHÁCH HÀNG - TẠO ĐƠN HÀNG
# =====================================================
@don_hang_bp.route("/", methods=["POST"])
def create_don_hang():
    data = request.json
    nguoiDung_id = data["nguoiDung_id"]
    diaChiGiaoHang = data.get("diaChiGiaoHang")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT gh.sanPham_id, gh.soLuong, sp.gia
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, (nguoiDung_id,))

    cart_items = cursor.fetchall()
    if not cart_items:
        return jsonify({"message": "Giỏ hàng trống"}), 400

    tongTien = sum(item[1] * item[2] for item in cart_items)

    cursor.execute("""
        INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang)
        OUTPUT INSERTED.id
        VALUES (?, ?, ?)
    """, (nguoiDung_id, tongTien, diaChiGiaoHang))

    donHang_id = cursor.fetchone()[0]

    for item in cart_items:
        cursor.execute("""
            INSERT INTO ChiTietDonHang
            (donHang_id, sanPham_id, soLuong, gia)
            VALUES (?, ?, ?, ?)
        """, (donHang_id, item[0], item[1], item[2]))

    cursor.execute("DELETE FROM GioHang WHERE nguoiDung_id = ?", (nguoiDung_id,))
    conn.commit()

    return jsonify({
        "success": True,
        "donHang_id": donHang_id,
        "tongTien": tongTien
    })


# =====================================================
# KHÁCH HÀNG - XEM CHI TIẾT ĐƠN HÀNG
# =====================================================
@don_hang_bp.route("/<int:donHang_id>", methods=["GET"])
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
        SELECT sp.tenSanPham, ctdh.soLuong, ctdh.gia
        FROM ChiTietDonHang ctdh
        JOIN SanPham sp ON ctdh.sanPham_id = sp.id
        WHERE ctdh.donHang_id = ?
    """, (donHang_id,))

    sanPham = [{
        "tenSanPham": i[0],
        "soLuong": i[1],
        "gia": float(i[2])
    } for i in cursor.fetchall()]

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
