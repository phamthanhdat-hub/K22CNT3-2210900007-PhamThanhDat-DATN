from flask import Blueprint, request, jsonify
from db import get_db
from utils.jwt_helper import lay_user_tu_token

danh_gia_bp = Blueprint("danh_gia", __name__)

# =====================================================
# LẤY ĐÁNH GIÁ THEO SẢN PHẨM
# =====================================================
@danh_gia_bp.route("/san-pham/<int:sanPham_id>", methods=["GET"])
def get_danh_gia_by_san_pham(sanPham_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            dg.id,
            dg.nguoiDung_id,
            nd.hoTen,
            dg.soSao,
            dg.noiDung,
            dg.ngayDanhGia
        FROM DanhGia dg
        JOIN NguoiDung nd ON dg.nguoiDung_id = nd.id
        WHERE dg.sanPham_id = ?
        ORDER BY dg.ngayDanhGia DESC
    """, (sanPham_id,))

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "nguoiDung_id": r[1],
            "hoTen": r[2],
            "soSao": r[3],
            "noiDung": r[4],
            "ngayDanhGia": r[5].isoformat() if r[5] else None
        })

    # Tính trung bình số sao
    cursor.execute("""
        SELECT AVG(CAST(soSao AS FLOAT)), COUNT(*)
        FROM DanhGia
        WHERE sanPham_id = ?
    """, (sanPham_id,))

    avg_result = cursor.fetchone()
    trungBinhSao = float(avg_result[0]) if avg_result[0] else 0
    tongSoDanhGia = avg_result[1] if avg_result[1] else 0

    return jsonify({
        "danhGia": data,
        "thongKe": {
            "trungBinhSao": round(trungBinhSao, 1),
            "tongSoDanhGia": tongSoDanhGia
        }
    })


# =====================================================
# TẠO ĐÁNH GIÁ MỚI
# =====================================================
@danh_gia_bp.route("", methods=["POST"])
def create_danh_gia():
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]
    data = request.json
    sanPham_id = data.get("sanPham_id")
    soSao = data.get("soSao")
    noiDung = data.get("noiDung", "")

    if not sanPham_id or not soSao:
        return jsonify({
            "success": False,
            "message": "Thiếu thông tin sản phẩm hoặc số sao"
        }), 400

    if soSao < 1 or soSao > 5:
        return jsonify({
            "success": False,
            "message": "Số sao phải từ 1 đến 5"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra xem đã đánh giá chưa
    cursor.execute("""
        SELECT id FROM DanhGia
        WHERE nguoiDung_id = ? AND sanPham_id = ?
    """, (nguoiDung_id, sanPham_id))

    existing = cursor.fetchone()

    if existing:
        # Cập nhật đánh giá cũ
        cursor.execute("""
            UPDATE DanhGia
            SET soSao = ?, noiDung = ?, ngayDanhGia = GETDATE()
            WHERE id = ?
        """, (soSao, noiDung, existing[0]))
    else:
        # Tạo đánh giá mới
        cursor.execute("""
            INSERT INTO DanhGia (nguoiDung_id, sanPham_id, soSao, noiDung)
            VALUES (?, ?, ?, ?)
        """, (nguoiDung_id, sanPham_id, soSao, noiDung))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Đánh giá thành công"
    })


# =====================================================
# CẬP NHẬT ĐÁNH GIÁ
# =====================================================
@danh_gia_bp.route("/<int:id>", methods=["PUT"])
def update_danh_gia(id):
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]
    data = request.json
    soSao = data.get("soSao")
    noiDung = data.get("noiDung", "")

    if not soSao:
        return jsonify({
            "success": False,
            "message": "Thiếu số sao"
        }), 400

    if soSao < 1 or soSao > 5:
        return jsonify({
            "success": False,
            "message": "Số sao phải từ 1 đến 5"
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra quyền sở hữu
    cursor.execute("""
        SELECT nguoiDung_id FROM DanhGia
        WHERE id = ?
    """, (id,))

    result = cursor.fetchone()
    if not result:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy đánh giá"
        }), 404

    if result[0] != nguoiDung_id:
        return jsonify({
            "success": False,
            "message": "Không có quyền chỉnh sửa đánh giá này"
        }), 403

    # Cập nhật
    cursor.execute("""
        UPDATE DanhGia
        SET soSao = ?, noiDung = ?, ngayDanhGia = GETDATE()
        WHERE id = ?
    """, (soSao, noiDung, id))

    conn.commit()

    return jsonify({
        "success": True,
        "message": "Cập nhật đánh giá thành công"
    })


# =====================================================
# XÓA ĐÁNH GIÁ
# =====================================================
@danh_gia_bp.route("/<int:id>", methods=["DELETE"])
def delete_danh_gia(id):
    user = lay_user_tu_token()
    if not user:
        return jsonify({"message": "Chưa đăng nhập"}), 401

    nguoiDung_id = user["id"]

    conn = get_db()
    cursor = conn.cursor()

    # Kiểm tra quyền sở hữu
    cursor.execute("""
        SELECT nguoiDung_id FROM DanhGia
        WHERE id = ?
    """, (id,))

    result = cursor.fetchone()
    if not result:
        return jsonify({
            "success": False,
            "message": "Không tìm thấy đánh giá"
        }), 404

    if result[0] != nguoiDung_id:
        return jsonify({
            "success": False,
            "message": "Không có quyền xóa đánh giá này"
        }), 403

    # Xóa
    cursor.execute("DELETE FROM DanhGia WHERE id = ?", (id,))
    conn.commit()

    return jsonify({
        "success": True,
        "message": "Xóa đánh giá thành công"
    })




