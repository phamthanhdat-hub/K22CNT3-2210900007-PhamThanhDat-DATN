import jwt
from datetime import datetime, timedelta

SECRET_KEY = "BABYCUTIE_SECRET_2026"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# =========================
# TẠO TOKEN
# =========================
def tao_token(payload: dict):
    data = payload.copy()   # tránh sửa payload gốc
    now = datetime.utcnow()

    data.update({
        "iat": now,
        "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS)
    })

    token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
    return token


# =========================
# GIẢI MÃ TOKEN
# =========================
def giai_ma_token(token: str):
    try:
        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return decoded

    except jwt.ExpiredSignatureError:
        print("Token hết hạn")
        return None

    except jwt.InvalidTokenError:
        print("Token không hợp lệ")
        return None
