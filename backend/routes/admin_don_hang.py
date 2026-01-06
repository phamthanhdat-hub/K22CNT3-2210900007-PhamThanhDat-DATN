from flask import Blueprint, jsonify, request
from db import get_db

admin_don_hang_bp = Blueprint("admin_don_hang_bp", __name__)

# =====================================================
# ADMIN - DANH SÁCH ĐƠN HÀNG
# =====================================================
@admin_don_hang_bp.route("/", methods=["GET"])
def get_all_don_hang():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dh.id, nd.hoTen, nd.dienThoai,
            dh.tongTien, dh.trangThai,
            dh.ngayDat, dh.diaChiGiaoHang
        FROM DonHang dh
        JOIN NguoiDung nd ON dh.nguoiDung_id = nd.id
        ORDER BY dh.ngayDat DESC
    """)

    data = [{
        "id": r[0],
        "hoTen": r[1],
        "dienThoai": r[2],
        "tongTien": float(r[3]),
        "trangThai": r[4],
        "ngayDat": r[5],
        "diaChiGiaoHang": r[6]
    } for r in cursor.fetchall()]

    return jsonify(data)


# =====================================================
# ADMIN - CẬP NHẬT TRẠNG THÁI
# =====================================================
@admin_don_hang_bp.route("/<int:donHang_id>/trang-thai", methods=["PUT"])
def update_trang_thai_don_hang(donHang_id):
    trangThai = request.json["trangThai"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE DonHang
        SET trangThai = ?
        WHERE id = ?
    """, (trangThai, donHang_id))

    conn.commit()
    return jsonify({"success": True, "message": "Cập nhật trạng thái thành công"})
