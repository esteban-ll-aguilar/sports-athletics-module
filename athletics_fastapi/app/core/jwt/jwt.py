import time
import uuid
import jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from redis.exceptions import RedisError

from app.core.config.enviroment import _SETTINGS
from app.core.cache.redis import _redis
from app.core.db.database import get_session
from app.modules.auth.domain.models import AuthUserModel
from app.core.jwt.secret_rotation import JWTSecretRotation


# ============================
# Password hashing (Argon2)
# ============================
pwd_ctx = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

# ============================
# Error Messages Constants
# ============================
ERROR_SESSION_EXPIRED = "Sesión expirada"
ERROR_INVALID_TOKEN = "Token inválido"
ERROR_INVALID_OR_EXPIRED_TOKEN = "Token inválido o expirado"
ERROR_UNAUTHORIZED_USER = "Usuario no autorizado"


class PasswordHasher:
    def hash(self, password: str) -> str:
        return pwd_ctx.hash(password)

    def verify(self, password: str, password_hash: str) -> bool:
        return pwd_ctx.verify(password, password_hash)


# ============================
# JWT Manager
# ============================
class JWTManager:
    def __init__(self):
        self.algorithm = _SETTINGS.jwt_algorithm

        # 🔐 Secret rotation
        self.secret_rotation = JWTSecretRotation()
        self.secret = self.secret_rotation.get_current_secret()

        self.access_exp = timedelta(minutes=_SETTINGS.access_token_expires_minutes)
        self.refresh_exp = timedelta(days=_SETTINGS.refresh_token_expires_days)

        # 🔥 Redis (puede ser None si cae)
        self.redis = _redis.get_client()

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _encode(self, payload: dict, exp_delta: timedelta) -> str:
        iat = self._now()
        exp = iat + exp_delta

        to_encode = payload | {
            "iat": int(iat.timestamp()),
            "exp": int(exp.timestamp()),
            "jti": str(uuid.uuid4()),
        }

        current_secret = self.secret_rotation.get_current_secret()
        return jwt.encode(to_encode, current_secret, algorithm=self.algorithm)

    # ============================
    # Token creation
    # ============================
    def create_access_token(self, sub: str, role: str, email: str, name: str) -> str:
        return self._encode(
            {
                "sub": str(sub),
                "type": "access",
                "role": role,
                "email": email,
                "name": name,
            },
            self.access_exp,
        )

    def create_refresh_token(self, sub: str, role: str, email: str, name: str) -> str:
        return self._encode(
            {
                "sub": str(sub),
                "type": "refresh",
                "role": role,
                "email": email,
                "name": name,
            },
            self.refresh_exp,
        )

    # ============================
    # Decode
    # ============================
    def decode(self, token: str) -> dict[str, Any]:
        valid_secrets = self.secret_rotation.get_all_valid_secrets()

        for secret in valid_secrets:
            try:
                return jwt.decode(token, secret, algorithms=[self.algorithm])
            except jwt.PyJWTError:
                continue

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERROR_INVALID_OR_EXPIRED_TOKEN,
        )

    # ============================
    # Redis helpers (SEGUROS)
    # ============================
    async def is_revoked(self, jti: str) -> bool:
        if not self.redis:
            return True
        try:
            return bool(await self.redis.exists(f"bl:{jti}"))
        except RedisError:
            return True

    async def revoke_until(self, jti: str, exp_ts: int) -> None:
        if not self.redis:
            return
        ttl = max(0, exp_ts - int(time.time()))
        try:
            await self.redis.setex(f"bl:{jti}", ttl, "1")
        except RedisError:
            pass

    async def store_refresh(self, jti: str, sub: str, exp_ts: int) -> None:
        if not self.redis:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_SESSION_EXPIRED,
            )

        ttl = max(0, exp_ts - int(time.time()))
        try:
            await self.redis.setex(f"rt:{jti}", ttl, sub)
        except RedisError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=ERROR_SESSION_EXPIRED,
            )

    async def consume_refresh(self, jti: str) -> Optional[str]:
        if not self.redis:
            return None

        try:
            pipe = self.redis.pipeline()
            pipe.get(f"rt:{jti}")
            pipe.delete(f"rt:{jti}")
            val, _ = await pipe.execute()
            return val
        except RedisError:
            return None


# ============================
# Get current user
# ============================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> AuthUserModel:

    jwtm = JWTManager()
    payload = jwtm.decode(token)

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail=ERROR_INVALID_TOKEN)

    jti = payload.get("jti")
    if not jti or await jwtm.is_revoked(jti):
        raise HTTPException(status_code=401, detail=ERROR_SESSION_EXPIRED)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail=ERROR_INVALID_TOKEN)

    # ⚠️ user_id se guarda como string → convertir a int
    # Importar UserModel aquí para evitar ciclos si es necesario, o asegura que está arriba
    from app.modules.auth.domain.models.user_model import UserModel

    result = await session.execute(
        select(AuthUserModel)
        .where(AuthUserModel.id == int(user_id))
        .options(
            selectinload(AuthUserModel.profile).options(
                selectinload(UserModel.atleta),
                selectinload(UserModel.entrenador),
                selectinload(UserModel.representante)
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail=ERROR_UNAUTHORIZED_USER)

    return user
