from flask import Blueprint, jsonify, request
from db import get_db
from datetime import datetime

admin_khuyen_mai_bp = Blueprint("admin_khuyen_mai", __name__)

# =====================================================
# LẤY TẤT CẢ KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("", methods=["GET"])
def get_all_khuyen_mai():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            id, tenKhuyenMai, maKhuyenMai, loaiGiamGia,
            giaTriGiam, giaTriToiDa, donHangToiThieu,
            ngayBatDau, ngayKetThuc, trangThai, ngayTao
        FROM KhuyenMai
        ORDER BY ngayTao DESC
    """)

    rows = cursor.fetchall()
    data = []

    for r in rows:
        data.append({
            "id": r[0],
            "tenKhuyenMai": r[1],
            "maKhuyenMai": r[2],
            "loaiGiamGia": r[3],
            "giaTriGiam": float(r[4]),
            "giaTriToiDa": float(r[5]) if r[5] else None,
            "donHangToiThieu": float(r[6]) if r[6] else None,
            "ngayBatDau": r[7].isoformat() if r[7] else None,
            "ngayKetThuc": r[8].isoformat() if r[8] else None,
            "trangThai": r[9],
            "ngayTao": r[10].isoformat() if r[10] else None
        })

    return jsonify(data)

# =====================================================
# TẠO KHUYẾN MÃI MỚI
# =====================================================
@admin_khuyen_mai_bp.route("", methods=["POST"])
def create_khuyen_mai():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO KhuyenMai
        (tenKhuyenMai, maKhuyenMai, loaiGiamGia, giaTriGiam,
         giaTriToiDa, donHangToiThieu, ngayBatDau, ngayKetThuc, trangThai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["tenKhuyenMai"],
        data["maKhuyenMai"],
        data["loaiGiamGia"],
        data["giaTriGiam"],
        data.get("giaTriToiDa"),
        data.get("donHangToiThieu"),
        data.get("ngayBatDau"),
        data.get("ngayKetThuc"),
        data.get("trangThai", 1)
    ))

    conn.commit()
    return jsonify({"success": True, "message": "Thêm khuyến mãi thành công"})

# =====================================================
# CẬP NHẬT KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("/<int:id>", methods=["PUT"])
def update_khuyen_mai(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE KhuyenMai
        SET tenKhuyenMai = ?, maKhuyenMai = ?, loaiGiamGia = ?,
            giaTriGiam = ?, giaTriToiDa = ?, donHangToiThieu = ?,
            ngayBatDau = ?, ngayKetThuc = ?, trangThai = ?
        WHERE id = ?
    """, (
        data["tenKhuyenMai"],
        data["maKhuyenMai"],
        data["loaiGiamGia"],
        data["giaTriGiam"],
        data.get("giaTriToiDa"),
        data.get("donHangToiThieu"),
        data.get("ngayBatDau"),
        data.get("ngayKetThuc"),
        data.get("trangThai", 1),
        id
    ))

    conn.commit()
    return jsonify({"success": True, "message": "Cập nhật khuyến mãi thành công"})

# =====================================================
# XÓA KHUYẾN MÃI
# =====================================================
@admin_khuyen_mai_bp.route("/<int:id>", methods=["DELETE"])
def delete_khuyen_mai(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM KhuyenMai WHERE id = ?", (id,))
    conn.commit()

    return jsonify({"success": True, "message": "Xóa khuyến mãi thành công"})

