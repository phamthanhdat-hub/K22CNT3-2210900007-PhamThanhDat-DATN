from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection

app = Flask(__name__)
CORS(app)

# =============================
# API: LẤY DANH SÁCH SẢN PHẨM
# =============================
@app.route("/api/san-pham", methods=["GET"])
def get_san_pham():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, tenSanPham, gia, hinhAnh, doTuoi
        FROM SanPham
        WHERE trangThai = 1
    """)
    rows = cursor.fetchall()

    data = []
    for r in rows:
        data.append({
            "id": r.id,
            "tenSanPham": r.tenSanPham,
            "gia": r.gia,
            "hinhAnh": r.hinhAnh,
            "doTuoi": r.doTuoi
        })

    return jsonify(data)


# =============================
# API: CHI TIẾT SẢN PHẨM
# =============================
@app.route("/api/san-pham/<int:id>")
def chi_tiet_san_pham(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM SanPham WHERE id = ?
    """, id)

    r = cursor.fetchone()
    if not r:
        return jsonify({"message": "Không tìm thấy"}), 404

    return jsonify({
        "id": r.id,
        "tenSanPham": r.tenSanPham,
        "moTa": r.moTa,
        "gia": r.gia,
        "doTuoi": r.doTuoi,
        "protein": r.protein,
        "carb": r.carb,
        "chatBeo": r.chatBeo
    })


# =============================
# API: GIỎ HÀNG THEO USER
# =============================
@app.route("/api/gio-hang/<int:user_id>")
def gio_hang(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT gh.id, sp.tenSanPham, gh.soLuong, sp.gia
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE gh.nguoiDung_id = ?
    """, user_id)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r.id,
            "tenSanPham": r.tenSanPham,
            "soLuong": r.soLuong,
            "gia": r.gia
        })

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
