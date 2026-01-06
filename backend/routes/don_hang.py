from flask import Blueprint, request, jsonify
from db import get_db

don_hang_bp = Blueprint("don_hang", __name__)

# =====================================================
# 1️⃣ LẤY ĐƠN HÀNG THEO NGƯỜI DÙNG
# =====================================================
@don_hang_bp.route("/nguoi-dung/<int:nguoiDung_id>", methods=["GET"])
def get_don_hang_by_user(nguoiDung_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, tongTien, trangThai, ngayDat, diaChiGiaoHang
        FROM DonHang
        WHERE nguoiDung_id = ?
        ORDER BY ngayDat DESC
    """, (nguoiDung_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tongTien": float(r[1]),
            "trangThai": r[2],
            "ngayDat": r[3],
            "diaChiGiaoHang": r[4]
        })

    return jsonify(data)


# =====================================================
# 2️⃣ LẤY CHI TIẾT 1 ĐƠN HÀNG
# =====================================================
@don_hang_bp.route("/<int:donHang_id>", methods=["GET"])
def get_chi_tiet_don_hang(donHang_id):
    conn = get_db()
    cursor = conn.cursor()

    # Thông tin đơn hàng
    cursor.execute("""
        SELECT id, nguoiDung_id, tongTien, trangThai, ngayDat, diaChiGiaoHang
        FROM DonHang
        WHERE id = ?
    """, (donHang_id,))
    dh = cursor.fetchone()

    if not dh:
        return jsonify({"message": "Không tìm thấy đơn hàng"}), 404

    # Chi tiết sản phẩm
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
            "nguoiDung_id": dh[1],
            "tongTien": float(dh[2]),
            "trangThai": dh[3],
            "ngayDat": dh[4],
            "diaChiGiaoHang": dh[5]
        },
        "sanPham": sanPham
    })


# =====================================================
# 3️⃣ TẠO ĐƠN HÀNG TỪ GIỎ HÀNG
# =====================================================
@don_hang_bp.route("", methods=["POST"])
def tao_don_hang():
    data = request.json
    nguoiDung_id = data["nguoiDung_id"]
    diaChi = data.get("diaChiGiaoHang", "")

    conn = get_db()
    cursor = conn.cursor()

    # Lấy giỏ hàng
    cursor.execute("""
        SELECT gh.sanPham_id, gh.soLuong, sp.gia
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, (nguoiDung_id,))
    gio_hang = cursor.fetchall()

    if not gio_hang:
        return jsonify({"message": "Giỏ hàng trống"}), 400

    tongTien = sum(row[1] * row[2] for row in gio_hang)

    # Tạo đơn hàng
    cursor.execute("""
        INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang)
        OUTPUT INSERTED.id
        VALUES (?, ?, ?)
    """, (nguoiDung_id, tongTien, diaChi))

    donHang_id = cursor.fetchone()[0]

    # Thêm chi tiết đơn hàng
    for sp_id, soLuong, gia in gio_hang:
        cursor.execute("""
            INSERT INTO ChiTietDonHang
            (donHang_id, sanPham_id, soLuong, gia)
            VALUES (?, ?, ?, ?)
        """, (donHang_id, sp_id, soLuong, gia))

    # Xóa giỏ hàng
    cursor.execute("""
        DELETE FROM GioHang WHERE nguoiDung_id = ?
    """, (nguoiDung_id,))

    conn.commit()

    return jsonify({
        "success": True,
        "donHang_id": donHang_id,
        "tongTien": tongTien
    })


# =====================================================
# 4️⃣ ADMIN – CẬP NHẬT TRẠNG THÁI
# =====================================================
@don_hang_bp.route("/<int:id>/trang-thai", methods=["PUT"])
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
