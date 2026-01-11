from flask import Blueprint, request, jsonify
from db import get_db

admin_danh_muc_bp = Blueprint("admin_danh_muc", __name__)

# =====================================================
# LẤY TẤT CẢ DANH MỤC
# =====================================================
@admin_danh_muc_bp.route("", methods=["GET"])
def get_all_danh_muc():
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, tenDanhMuc, moTa, danhMucCha_id
            FROM DanhMuc
            ORDER BY tenDanhMuc
        """)

        rows = cursor.fetchall()
        data = []

        for r in rows:
            data.append({
                "id": r[0],
                "tenDanhMuc": r[1],
                "moTa": r[2],
                "danhMucCha_id": r[3]
            })

        return jsonify(data)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# LẤY CHI TIẾT 1 DANH MỤC
# =====================================================
@admin_danh_muc_bp.route("/<int:id>", methods=["GET"])
def get_danh_muc_by_id(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, tenDanhMuc, moTa, danhMucCha_id
            FROM DanhMuc
            WHERE id = ?
        """, (id,))

        r = cursor.fetchone()
        if not r:
            return jsonify({"success": False, "message": "Không tìm thấy danh mục"}), 404

        return jsonify({
            "id": r[0],
            "tenDanhMuc": r[1],
            "moTa": r[2],
            "danhMucCha_id": r[3]
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Lỗi hệ thống: {str(e)}"
        }), 500


# =====================================================
# THÊM DANH MỤC MỚI
# =====================================================
@admin_danh_muc_bp.route("", methods=["POST"])
def create_danh_muc():
    try:
        data = request.json

        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400

        tenDanhMuc = data.get("tenDanhMuc", "").strip()
        moTa = data.get("moTa", "").strip() or None
        danhMucCha_id = data.get("danhMucCha_id") or None

        if not tenDanhMuc or len(tenDanhMuc) < 2:
            return jsonify({"success": False, "message": "Tên danh mục phải có ít nhất 2 ký tự"}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra tên danh mục đã tồn tại chưa
        cursor.execute("SELECT id FROM DanhMuc WHERE tenDanhMuc = ?", (tenDanhMuc,))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Tên danh mục đã tồn tại"}), 400

        # Kiểm tra danh mục cha nếu có
        if danhMucCha_id:
            cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (danhMucCha_id,))
            if not cursor.fetchone():
                return jsonify({"success": False, "message": "Danh mục cha không tồn tại"}), 400

        cursor.execute("""
            INSERT INTO DanhMuc (tenDanhMuc, moTa, danhMucCha_id)
            VALUES (?, ?, ?)
        """, (tenDanhMuc, moTa, danhMucCha_id))

        conn.commit()
        return jsonify({"success": True, "message": "Thêm danh mục thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# CẬP NHẬT DANH MỤC
# =====================================================
@admin_danh_muc_bp.route("/<int:id>", methods=["PUT"])
def update_danh_muc(id):
    try:
        data = request.json

        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400

        tenDanhMuc = data.get("tenDanhMuc", "").strip()
        moTa = data.get("moTa", "").strip() or None
        danhMucCha_id = data.get("danhMucCha_id") or None

        if not tenDanhMuc or len(tenDanhMuc) < 2:
            return jsonify({"success": False, "message": "Tên danh mục phải có ít nhất 2 ký tự"}), 400

        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra danh mục có tồn tại không
        cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Danh mục không tồn tại"}), 404

        # Kiểm tra tên danh mục đã tồn tại chưa (trừ chính nó)
        cursor.execute("SELECT id FROM DanhMuc WHERE tenDanhMuc = ? AND id != ?", (tenDanhMuc, id))
        if cursor.fetchone():
            return jsonify({"success": False, "message": "Tên danh mục đã tồn tại"}), 400

        # Kiểm tra danh mục cha nếu có
        if danhMucCha_id:
            if danhMucCha_id == id:
                return jsonify({"success": False, "message": "Danh mục không thể là danh mục cha của chính nó"}), 400
            cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (danhMucCha_id,))
            if not cursor.fetchone():
                return jsonify({"success": False, "message": "Danh mục cha không tồn tại"}), 400

        cursor.execute("""
            UPDATE DanhMuc
            SET tenDanhMuc = ?, moTa = ?, danhMucCha_id = ?
            WHERE id = ?
        """, (tenDanhMuc, moTa, danhMucCha_id, id))

        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật danh mục thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# XÓA DANH MỤC
# =====================================================
@admin_danh_muc_bp.route("/<int:id>", methods=["DELETE"])
def delete_danh_muc(id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Kiểm tra danh mục có tồn tại không
        cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Danh mục không tồn tại"}), 404

        # Kiểm tra có sản phẩm nào đang dùng danh mục này không
        cursor.execute("SELECT COUNT(*) FROM SanPham WHERE danhMuc_id = ?", (id,))
        count = cursor.fetchone()[0]
        if count > 0:
            return jsonify({
                "success": False,
                "message": f"Không thể xóa danh mục này vì đang có {count} sản phẩm sử dụng"
            }), 400

        # Kiểm tra có danh mục con không
        cursor.execute("SELECT COUNT(*) FROM DanhMuc WHERE danhMucCha_id = ?", (id,))
        count = cursor.fetchone()[0]
        if count > 0:
            return jsonify({
                "success": False,
                "message": f"Không thể xóa danh mục này vì đang có {count} danh mục con"
            }), 400

        cursor.execute("DELETE FROM DanhMuc WHERE id = ?", (id,))

        conn.commit()
        return jsonify({"success": True, "message": "Xóa danh mục thành công"})

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500





