import jwt
import uuid
from datetime import datetime, timedelta, timezone

SECRET = "test_secret"
ALGORITHM = "HS256"

def test_jwt_int_sub():
    payload = {
        "sub": 123,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
        "jti": str(uuid.uuid4())
    }
    
    print(f"Payload to encode: {payload}")
    
    try:
        token = jwt.encode(payload, SECRET, algorithm=ALGORITHM)
        print(f"Encoded token: {token}")
    except Exception as e:
        print(f"Encoding failed: {e}")
        return

    try:
        decoded = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        print(f"Decoded payload: {decoded}")
        print(f"Type of sub: {type(decoded['sub'])}")
    except Exception as e:
        print(f"Decoding failed: {e}")

if __name__ == "__main__":
    test_jwt_int_sub()
