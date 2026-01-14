from flask import Blueprint, jsonify, request
from db import get_db

thuc_don_bp = Blueprint("thuc_don_bp", __name__)

# =====================================================
# GET ALL DANH MỤC
# =====================================================
@thuc_don_bp.route("/danh-muc", methods=["GET"])
def get_all_danh_muc():
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

# =====================================================
# GET ALL SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/", methods=["GET"])
def get_all_san_pham():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            sp.id,
            sp.tenSanPham,
            sp.moTa,
            sp.gia,
            sp.hinhAnh,
            sp.doTuoi,
            sp.protein,
            sp.carb,
            sp.chatBeo,
            sp.danhMuc_id,
            dm.tenDanhMuc
        FROM SanPham sp
        JOIN DanhMuc dm ON sp.danhMuc_id = dm.id
        WHERE sp.trangThai = 1
        ORDER BY sp.ngayTao DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tenSanPham": r[1],
            "moTa": r[2],
            "gia": float(r[3]),
            "hinhAnh": r[4],
            "doTuoi": r[5],
            "protein": r[6],
            "carb": r[7],
            "chatBeo": r[8],
            "danhMuc_id": r[9],
            "tenDanhMuc": r[10]
        })

    return jsonify(data)


# =====================================================
# GET CHI TIẾT 1 SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/<int:id>", methods=["GET"])
def get_san_pham_by_id(id):
    conn = get_db()
    cursor = conn.cursor()

    # Admin có thể xem cả sản phẩm đã bị xóa (trangThai = 0)
    cursor.execute("""
        SELECT 
            id, tenSanPham, moTa, gia, hinhAnh,
            doTuoi, protein, carb, chatBeo, danhMuc_id, trangThai
        FROM SanPham
        WHERE id = ?
    """, (id,))

    r = cursor.fetchone()
    if not r:
        return jsonify({"message": "Không tìm thấy sản phẩm"}), 404

    return jsonify({
        "id": r[0],
        "tenSanPham": r[1],
        "moTa": r[2],
        "gia": float(r[3]),
        "hinhAnh": r[4],
        "doTuoi": r[5],
        "protein": float(r[6]) if r[6] else None,
        "carb": float(r[7]) if r[7] else None,
        "chatBeo": float(r[8]) if r[8] else None,
        "danhMuc_id": r[9],
        "trangThai": bool(r[10]) if r[10] is not None else True
    })


# =====================================================
# ADMIN - THÊM SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/", methods=["POST"])
def create_san_pham():
    try:
        data = request.json
        
        # Validation
        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400
        
        tenSanPham = data.get("tenSanPham", "").strip()
        gia = data.get("gia")
        danhMuc_id = data.get("danhMuc_id")
        
        if not tenSanPham or len(tenSanPham) < 3:
            return jsonify({"success": False, "message": "Tên sản phẩm phải có ít nhất 3 ký tự"}), 400
        
        if not gia or float(gia) <= 0:
            return jsonify({"success": False, "message": "Giá sản phẩm phải lớn hơn 0"}), 400
        
        if not danhMuc_id:
            return jsonify({"success": False, "message": "Vui lòng chọn danh mục"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra danh mục có tồn tại không
        cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (danhMuc_id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Danh mục không tồn tại"}), 400
        
        cursor.execute("""
            INSERT INTO SanPham
            (tenSanPham, moTa, gia, hinhAnh, doTuoi,
             protein, carb, chatBeo, danhMuc_id, trangThai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            tenSanPham,
            data.get("moTa", "").strip() or None,
            float(gia),
            data.get("hinhAnh", "").strip() or None,
            data.get("doTuoi", "").strip() or None,
            float(data.get("protein")) if data.get("protein") else None,
            float(data.get("carb")) if data.get("carb") else None,
            float(data.get("chatBeo")) if data.get("chatBeo") else None,
            int(danhMuc_id),
            data.get("trangThai", 1)
        ))

        conn.commit()
        return jsonify({"success": True, "message": "Thêm sản phẩm thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# ADMIN - CẬP NHẬT SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/<int:id>", methods=["PUT"])
def update_san_pham(id):
    try:
        data = request.json
        
        # Validation
        if not data:
            return jsonify({"success": False, "message": "Thiếu dữ liệu"}), 400
        
        tenSanPham = data.get("tenSanPham", "").strip()
        gia = data.get("gia")
        danhMuc_id = data.get("danhMuc_id")
        
        if not tenSanPham or len(tenSanPham) < 3:
            return jsonify({"success": False, "message": "Tên sản phẩm phải có ít nhất 3 ký tự"}), 400
        
        if not gia or float(gia) <= 0:
            return jsonify({"success": False, "message": "Giá sản phẩm phải lớn hơn 0"}), 400
        
        if not danhMuc_id:
            return jsonify({"success": False, "message": "Vui lòng chọn danh mục"}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra sản phẩm có tồn tại không
        cursor.execute("SELECT id FROM SanPham WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Sản phẩm không tồn tại"}), 404
        
        # Kiểm tra danh mục có tồn tại không
        cursor.execute("SELECT id FROM DanhMuc WHERE id = ?", (danhMuc_id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Danh mục không tồn tại"}), 400

        cursor.execute("""
            UPDATE SanPham
            SET tenSanPham = ?, moTa = ?, gia = ?, hinhAnh = ?,
                doTuoi = ?, protein = ?, carb = ?, chatBeo = ?, 
                danhMuc_id = ?, trangThai = ?
            WHERE id = ?
        """, (
            tenSanPham,
            data.get("moTa", "").strip() or None,
            float(gia),
            data.get("hinhAnh", "").strip() or None,
            data.get("doTuoi", "").strip() or None,
            float(data.get("protein")) if data.get("protein") else None,
            float(data.get("carb")) if data.get("carb") else None,
            float(data.get("chatBeo")) if data.get("chatBeo") else None,
            int(danhMuc_id),
            data.get("trangThai", 1),
            id
        ))

        conn.commit()
        return jsonify({"success": True, "message": "Cập nhật sản phẩm thành công"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500


# =====================================================
# ADMIN - XÓA MỀM SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/<int:id>", methods=["DELETE"])
def delete_san_pham(id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kiểm tra sản phẩm có tồn tại không
        cursor.execute("SELECT id FROM SanPham WHERE id = ?", (id,))
        if not cursor.fetchone():
            return jsonify({"success": False, "message": "Sản phẩm không tồn tại"}), 404
        
        # Kiểm tra sản phẩm có trong đơn hàng không (tùy chọn - có thể bỏ qua)
        # cursor.execute("""
        #     SELECT COUNT(*) FROM ChiTietDonHang WHERE sanPham_id = ?
        # """, (id,))
        # count = cursor.fetchone()[0]
        # if count > 0:
        #     return jsonify({
        #         "success": False,
        #         "message": f"Không thể xóa sản phẩm này vì đã có {count} đơn hàng sử dụng"
        #     }), 400

        cursor.execute("""
            UPDATE SanPham
            SET trangThai = 0
            WHERE id = ?
        """, (id,))

        conn.commit()
        return jsonify({"success": True, "message": "Đã xóa sản phẩm"})
    
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return jsonify({"success": False, "message": f"Lỗi hệ thống: {str(e)}"}), 500