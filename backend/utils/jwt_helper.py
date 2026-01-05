import jwt
from datetime import datetime, timedelta

SECRET_KEY = "BABYCUTIE_SECRET_2026"
ALGORITHM = "HS256"

# =========================
# TẠO TOKEN
# =========================
def tao_token(payload):
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# =========================
# GIẢI MÃ TOKEN
# =========================
def giai_ma_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
