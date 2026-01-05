from functools import wraps
from flask import request, jsonify
from utils.jwt_helper import giai_ma_token

# =========================
# BẮT BUỘC ĐĂNG NHẬP
# =========================
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth or not auth.startswith("Bearer "):
            return jsonify({"message": "Thiếu token"}), 401

        token = auth.split(" ")[1]
        user = giai_ma_token(token)

        if not user:
            return jsonify({"message": "Token không hợp lệ"}), 401

        request.user = user
        return f(*args, **kwargs)
    return decorated

# =========================
# CHỈ ADMIN
# =========================
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth or not auth.startswith("Bearer "):
            return jsonify({"message": "Thiếu token"}), 401

        token = auth.split(" ")[1]
        user = giai_ma_token(token)

        if not user:
            return jsonify({"message": "Token không hợp lệ"}), 401

        if user.get("vaiTro") != "admin":
            return jsonify({"message": "Không có quyền truy cập"}), 403

        request.user = user
        return f(*args, **kwargs)
    return decorated
