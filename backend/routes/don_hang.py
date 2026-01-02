from flask import Blueprint, request, jsonify
from utils.db import get_connection

don_hang_bp = Blueprint('don_hang', __name__)

@don_hang_bp.route('/don-hang', methods=['POST'])
def tao_don():
    data = request.json
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO DonHang (nguoiDung_id, tongTien, trangThai)
        VALUES (?, ?, N'Chờ xử lý')
    """, data['nguoiDung_id'], data['tongTien'])

    conn.commit()
    return jsonify({"message": "Tạo đơn hàng thành công"})
