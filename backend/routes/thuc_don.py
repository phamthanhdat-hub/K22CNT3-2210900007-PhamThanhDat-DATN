from flask import Blueprint, jsonify, request
from db import get_db

thuc_don_bp = Blueprint("thuc_don_bp", __name__)

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

    cursor.execute("""
        SELECT 
            id, tenSanPham, moTa, gia, hinhAnh,
            doTuoi, protein, carb, chatBeo, danhMuc_id
        FROM SanPham
        WHERE id = ? AND trangThai = 1
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
        "protein": r[6],
        "carb": r[7],
        "chatBeo": r[8],
        "danhMuc_id": r[9]
    })


# =====================================================
# ADMIN - THÊM SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/", methods=["POST"])
def create_san_pham():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO SanPham
        (tenSanPham, moTa, gia, hinhAnh, doTuoi,
         protein, carb, chatBeo, danhMuc_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["tenSanPham"],
        data.get("moTa"),
        data["gia"],
        data.get("hinhAnh"),
        data.get("doTuoi"),
        data.get("protein"),
        data.get("carb"),
        data.get("chatBeo"),
        data["danhMuc_id"]
    ))

    conn.commit()
    return jsonify({"success": True, "message": "Thêm sản phẩm thành công"})


# =====================================================
# ADMIN - CẬP NHẬT SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/<int:id>", methods=["PUT"])
def update_san_pham(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE SanPham
        SET tenSanPham = ?, moTa = ?, gia = ?, hinhAnh = ?,
            doTuoi = ?, protein = ?, carb = ?, chatBeo = ?, danhMuc_id = ?
        WHERE id = ?
    """, (
        data["tenSanPham"],
        data.get("moTa"),
        data["gia"],
        data.get("hinhAnh"),
        data.get("doTuoi"),
        data.get("protein"),
        data.get("carb"),
        data.get("chatBeo"),
        data["danhMuc_id"],
        id
    ))

    conn.commit()
    return jsonify({"success": True, "message": "Cập nhật sản phẩm thành công"})


# =====================================================
# ADMIN - XÓA MỀM SẢN PHẨM
# =====================================================
@thuc_don_bp.route("/<int:id>", methods=["DELETE"])
def delete_san_pham(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE SanPham
        SET trangThai = 0
        WHERE id = ?
    """, (id,))

    conn.commit()
    return jsonify({"success": True, "message": "Đã xóa sản phẩm"})
