import time, uuid, jwt
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config.enviroment import _SETTINGS
from app.core.cache.redis import _redis
from app.core.db.database import get_session
from app.modules.auth.domain.models import AuthUserModel
from app.core.jwt.secret_rotation import JWTSecretRotation

pwd_ctx = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class PasswordHasher:
    def hash(self, password: str) -> str:
        return pwd_ctx.hash(password)

    def verify(self, password: str, password_hash: str) -> bool:
        return pwd_ctx.verify(password, password_hash)

class JWTManager:
    def __init__(self):
        self.algorithm = _SETTINGS.jwt_algorithm
        # Inicializar sistema de rotación
        self.secret_rotation = JWTSecretRotation()
        self.secret = self.secret_rotation.get_current_secret()
        
        self.access_exp = timedelta(minutes=_SETTINGS.access_token_expires_minutes)
        self.refresh_exp = timedelta(days=_SETTINGS.refresh_token_expires_days)
        self.redis = _redis.get_client()
        
        # Verificar si necesita rotación al inicializar
        if self.secret_rotation.should_rotate():
            from app.core.logging.logger import logger
            logger.warning("⚠️  JWT Secret necesita rotación. Ejecuta la rotación manual o automática.")

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _encode(self, payload: dict, exp_delta: timedelta) -> str:
        """Codifica un token usando el secret ACTUAL."""
        iat = self._now()
        exp = iat + exp_delta
        to_encode = payload | {"iat": int(iat.timestamp()), "exp": int(exp.timestamp()), "jti": str(uuid.uuid4())}
        # Siempre usar el secret actual para firmar
        current_secret = self.secret_rotation.get_current_secret()
        return jwt.encode(to_encode, current_secret, algorithm=self.algorithm)

    def create_access_token(self, sub: str) -> str:
        """Crea un access token con JTI único para revocación."""
        return self._encode({"sub": str(sub), "type": "access"}, self.access_exp)

    def create_refresh_token(self, sub: str) -> str:
        """Crea un refresh token con JTI único para revocación."""
        return self._encode({"sub": str(sub), "type": "refresh"}, self.refresh_exp)

    def decode(self, token: str) -> dict[str, Any]:
        """
        Decodifica un token usando TODOS los secrets válidos.
        Permite tokens firmados con secrets antiguos durante el período de gracia.
        """
        valid_secrets = self.secret_rotation.get_all_valid_secrets()
        
        # Intentar con cada secret válido
        last_error = None
        for secret in valid_secrets:
            try:
                return jwt.decode(token, secret, algorithms=[self.algorithm])
            except jwt.PyJWTError as e:
                last_error = e
                continue
        
        # Si ningún secret funcionó, lanzar error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token inválido o expirado"
        )

    async def is_revoked(self, jti: str) -> bool:
        return bool(await self.redis.exists(f"bl:{jti}"))

    async def revoke_until(self, jti: str, exp_ts: int) -> None:
        ttl = max(0, exp_ts - int(time.time()))
        await self.redis.setex(f"bl:{jti}", ttl, "1")

    async def store_refresh(self, jti: str, sub: str, exp_ts: int) -> None:
        ttl = max(0, exp_ts - int(time.time()))
        await self.redis.setex(f"rt:{jti}", ttl, sub)

    async def consume_refresh(self, jti: str) -> Optional[str]:
        pipe = self.redis.pipeline()
        pipe.get(f"rt:{jti}")
        pipe.delete(f"rt:{jti}")
        val, _ = await pipe.execute()
        return val

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> AuthUserModel:
    jwtm = JWTManager()
    payload = jwtm.decode(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Token inválido")
    jti = payload.get("jti")
    if not jti or await jwtm.is_revoked(jti):
        raise HTTPException(status_code=401, detail="Token revocado")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    res = await session.execute(select(AuthUserModel).where(AuthUserModel.id == user_id))
    user = res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario no autorizado")
    return user