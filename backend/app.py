from flask import Flask, jsonify, request
from flask_cors import CORS
import pyodbc

app = Flask(__name__)
CORS(app)

# ===============================
# KẾT NỐI SQL SERVER
# ===============================
def get_connection():
    return pyodbc.connect(
        "DRIVER={SQL Server};"
        "SERVER=DESKTOP-HD2ANFT\\MSSQLSERVER03;"
        "DATABASE=ChaoBabyCutie;"
        "Trusted_Connection=yes;"
    )

# ===============================
# API TEST
# ===============================
@app.route("/")
def home():
    return jsonify({"message": "BabyCutie API is running"})

# ===============================
# API: LẤY DANH SÁCH SẢN PHẨM
# ===============================
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

# ===============================
# API: CHI TIẾT SẢN PHẨM
# ===============================
@app.route("/api/san-pham/<int:id>")
def san_pham_chi_tiet(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM SanPham WHERE id = ?", id)
    r = cursor.fetchone()

    if not r:
        return jsonify({"message": "Không tìm thấy sản phẩm"}), 404

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

# ===============================
# API: GIỎ HÀNG THEO NGƯỜI DÙNG
# ===============================
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
            "gia": r.gia,
            "thanhTien": r.soLuong * r.gia
        })

    return jsonify(data)

# ===============================
# API: THÊM VÀO GIỎ HÀNG
# ===============================
@app.route("/api/gio-hang", methods=["POST"])
def them_gio_hang():
    data = request.json
    nguoiDung_id = data["nguoiDung_id"]
    sanPham_id = data["sanPham_id"]
    soLuong = data.get("soLuong", 1)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, soLuong FROM GioHang
        WHERE nguoiDung_id = ? AND sanPham_id = ?
    """, nguoiDung_id, sanPham_id)

    row = cursor.fetchone()

    if row:
        cursor.execute("""
            UPDATE GioHang
            SET soLuong = soLuong + ?
            WHERE id = ?
        """, soLuong, row.id)
    else:
        cursor.execute("""
            INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
            VALUES (?, ?, ?)
        """, nguoiDung_id, sanPham_id, soLuong)

    conn.commit()
    return jsonify({"message": "Đã thêm vào giỏ hàng"})

# ===============================
# API: TẠO ĐƠN HÀNG
# ===============================
@app.route("/api/don-hang", methods=["POST"])
def tao_don_hang():
    data = request.json
    nguoiDung_id = data["nguoiDung_id"]
    diaChi = data["diaChi"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT sanPham_id, soLuong, gia
        FROM GioHang gh
        JOIN SanPham sp ON gh.sanPham_id = sp.id
        WHERE nguoiDung_id = ?
    """, nguoiDung_id)

    items = cursor.fetchall()
    if not items:
        return jsonify({"message": "Giỏ hàng trống"}), 400

    tongTien = sum(i.soLuong * i.gia for i in items)

    cursor.execute("""
        INSERT INTO DonHang (nguoiDung_id, tongTien, diaChiGiaoHang)
        VALUES (?, ?, ?)
    """, nguoiDung_id, tongTien, diaChi)

    cursor.execute("SELECT SCOPE_IDENTITY()")
    donHang_id = cursor.fetchone()[0]

    for i in items:
        cursor.execute("""
            INSERT INTO ChiTietDonHang (donHang_id, sanPham_id, soLuong, gia)
            VALUES (?, ?, ?, ?)
        """, donHang_id, i.sanPham_id, i.soLuong, i.gia)

    cursor.execute("DELETE FROM GioHang WHERE nguoiDung_id = ?", nguoiDung_id)

    conn.commit()
    return jsonify({"message": "Đặt hàng thành công", "donHang_id": donHang_id})

# ===============================
# API: TIN TỨC
# ===============================
@app.route("/api/tin-tuc")
def tin_tuc():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT tt.id, tt.tieuDe, tt.noiDung, tt.hinhAnh, nd.hoTen
        FROM TinTuc tt
        LEFT JOIN NguoiDung nd ON tt.nguoiDung_id = nd.id
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r.id,
            "tieuDe": r.tieuDe,
            "noiDung": r.noiDung,
            "hinhAnh": r.hinhAnh,
            "nguoiDang": r.hoTen
        })

    return jsonify(data)

# ===============================
# API: KHUYẾN MẠI
# ===============================
@app.route("/api/khuyen-mai/<string:ma>")
def khuyen_mai(ma):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM KhuyenMai
        WHERE maKhuyenMai = ?
        AND trangThai = 1
        AND GETDATE() BETWEEN ngayBatDau AND ngayKetThuc
    """, ma)

    r = cursor.fetchone()
    if not r:
        return jsonify({"message": "Mã không hợp lệ"}), 404

    return jsonify({
        "tenKhuyenMai": r.tenKhuyenMai,
        "loaiGiamGia": r.loaiGiamGia,
        "giaTriGiam": r.giaTriGiam,
        "giaTriToiDa": r.giaTriToiDa,
        "donHangToiThieu": r.donHangToiThieu
    })

# ===============================
# CHẠY SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)
