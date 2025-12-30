from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache.redis import get_redis
from typing import Optional
from app.core.db.database import get_session
from app.core.jwt.jwt import JWTManager, PasswordHasher
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.modules.admin.services.auth_email_service import AuthEmailService
from app.modules.admin.services.password_reset_service import PasswordResetService
from app.modules.admin.services.email_verification_service import EmailVerificationService
from app.modules.admin.services.two_factor_service import TwoFactorService
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.core.jwt.jwt import get_current_user
# from app.modules.external.services import ExternalUsersApiService
# from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository

async def get_users_repo(session: AsyncSession = Depends(get_session)) -> AuthUsersRepository:
    return AuthUsersRepository(session)

async def get_sessions_repo(session: AsyncSession = Depends(get_session)) -> SessionsRepository:
    return SessionsRepository(session)

def get_jwt_manager() -> JWTManager:
    return JWTManager()

def get_password_hasher() -> PasswordHasher:
    return PasswordHasher()

def get_email_service() -> AuthEmailService:
    return AuthEmailService()

def get_password_reset_service() -> PasswordResetService:
    return PasswordResetService()

def get_email_verification_service() -> EmailVerificationService:
    return EmailVerificationService()

def get_two_factor_service() -> TwoFactorService:
    return TwoFactorService()


# async def get_external_users_api_service(session: AsyncSession = Depends(get_session)) -> ExternalUsersApiService:
#     repo = ExternalUsersApiRepository(session)
#     return ExternalUsersApiService(repo)


async def set_password_reset_code(email: str, code: str, ttl_seconds: int = 600) -> None:
    """
    Guarda el código de reseteo en Redis con TTL. Clave: pwd_reset:{email_lower}
    """
    r = get_redis()
    key = f"pwd_reset:{email.strip().lower()}"
    await r.setex(key, ttl_seconds, code)


async def get_password_reset_code(email: str) -> Optional[str]:
    r = get_redis()
    key = f"pwd_reset:{email.strip().lower()}"
    return await r.get(key)


async def delete_password_reset_code(email: str) -> None:
    r = get_redis()
    key = f"pwd_reset:{email.strip().lower()}"
    await r.delete(key)

#obteniendo el usuario actual y verificando si es admin
async def get_current_admin_user(current_user = Depends(get_current_user)):
    if current_user.role != RoleEnum.ADMINISTRADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user