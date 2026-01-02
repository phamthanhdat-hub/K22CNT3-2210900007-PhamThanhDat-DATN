from flask import Blueprint, jsonify
from utils.db import get_connection

danh_muc_bp = Blueprint('danh_muc', __name__)

@danh_muc_bp.route('/danh-muc')
def get_danh_muc():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, tenDanhMuc FROM DanhMuc")

    data = [{"id": r[0], "tenDanhMuc": r[1]} for r in cur.fetchall()]
    return jsonify(data)
