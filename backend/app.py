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
from routes.danh_gia import danh_gia_bp

# ADMIN
from routes.admin_don_hang import admin_don_hang_bp
from routes.auth_admin import admin_auth_bp
from routes.admin_dashboard import admin_dashboard_bp
from routes.admin_san_pham import admin_san_pham_bp
from routes.admin_khuyen_mai import admin_khuyen_mai_bp
from routes.admin_tin_tuc import admin_tin_tuc_bp
from routes.admin_lien_he import admin_lien_he_bp
from routes.admin_danh_gia import admin_danh_gia_bp

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
app.register_blueprint(danh_gia_bp, url_prefix="/api/danh-gia")

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
app.register_blueprint(
    admin_dashboard_bp,
    url_prefix="/api/admin/dashboard"
)
app.register_blueprint(
    admin_san_pham_bp,
    url_prefix="/api/admin/san-pham"
)
app.register_blueprint(
    admin_khuyen_mai_bp,
    url_prefix="/api/admin/khuyen-mai"
)
app.register_blueprint(
    admin_tin_tuc_bp,
    url_prefix="/api/admin/tin-tuc"
)
app.register_blueprint(
    admin_lien_he_bp,
    url_prefix="/api/admin/lien-he"
)
app.register_blueprint(
    admin_danh_gia_bp,
    url_prefix="/api/admin/danh-gia"
)

# =========================
# RUN
# =========================
if __name__ == "__main__":
    app.run(debug=True)
