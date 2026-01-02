from flask import Blueprint, request, jsonify
from utils.db import get_connection

gio_hang_bp = Blueprint('gio_hang', __name__)

@gio_hang_bp.route('/gio-hang', methods=['POST'])
def them_gio():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO GioHang (nguoiDung_id, sanPham_id, soLuong)
        VALUES (?, ?, ?)
    """, data['nguoiDung_id'], data['sanPham_id'], data['soLuong'])

    conn.commit()
    return jsonify({"message": "Đã thêm vào giỏ"})
