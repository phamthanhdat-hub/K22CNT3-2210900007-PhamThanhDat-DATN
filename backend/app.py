from flask import Flask, send_from_directory
from flask_cors import CORS

# ========= IMPORT ROUTES =========
from routes.auth import auth_bp
from routes.thuc_don import thuc_don_bp
from routes.don_hang import don_hang_bp
from routes.gio_hang import gio_hang_bp
from routes.thanh_toan import thanh_toan_bp
from routes.khuyen_mai import khuyen_mai_bp
from routes.tin_tuc import tin_tuc_bp
from routes.lien_he import lien_he_bp

# ADMIN
from routes.admin_don_hang import admin_don_hang_bp
from routes.auth_admin import admin_auth_bp

# ========= APP =========
app = Flask(__name__)
CORS(app)

# =========================
# SERVE IMAGE (CHO FRONTEND)
# =========================
@app.route("/images/<path:filename>")
def serve_image(filename):
    return send_from_directory("images", filename)

# =========================
# USER API
# =========================
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(thuc_don_bp, url_prefix="/api/thuc-don")
app.register_blueprint(gio_hang_bp, url_prefix="/api/gio-hang")
app.register_blueprint(don_hang_bp, url_prefix="/api/don-hang")
app.register_blueprint(thanh_toan_bp, url_prefix="/api/thanh-toan")
app.register_blueprint(khuyen_mai_bp, url_prefix="/api/khuyen-mai")
app.register_blueprint(tin_tuc_bp, url_prefix="/api/tin-tuc")
app.register_blueprint(lien_he_bp, url_prefix="/api/lien-he")

# =========================
# ADMIN API
# =========================
app.register_blueprint(
    admin_auth_bp,
    url_prefix="/api/admin/auth"
)

app.register_blueprint(
    admin_don_hang_bp,
    url_prefix="/api/admin/don-hang"
)

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
