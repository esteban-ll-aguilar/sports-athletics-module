"""

Dependencias para el módulo de administración
Se importan las dependencias necesarias para los servicios de usuario administrador

"""

from fastapi import Depends
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.services.admin_user_service import AdminUserService

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.cache.redis import get_redis
from typing import Optional
from app.core.db.database import get_session
from app.core.jwt.jwt import JWTManager, PasswordHasher
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.core.jwt.jwt import get_current_user
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.password_reset_service import PasswordResetService
from app.modules.auth.services.email_verification_service import EmailVerificationService
from app.modules.auth.services.two_factor_service import TwoFactorService


async def get_users_repo(session: AsyncSession = Depends(get_session)) -> AuthUsersRepository:
    return AuthUsersRepository(session)

# Dependencia para obtener el servicio de usuario administrador
def get_admin_user_service(
    users_repo: AuthUsersRepository = Depends(get_users_repo) 
) -> AdminUserService:
    return AdminUserService(users_repo)


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
    from app.core.logging.logger import logger
    logger.info(f"🔍 [AUTH DEBUG] Checking admin permissions for user: {current_user.email}")
    if not current_user.profile:
        logger.warning(f"⚠️ [AUTH DEBUG] User {current_user.email} has no profile")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario sin perfil configurado"
        )
    
    logger.info(f"🔍 [AUTH DEBUG] User role: {current_user.profile.role}")
    if current_user.profile.role != RoleEnum.ADMINISTRADOR:
        logger.warning(f"⚠️ [AUTH DEBUG] User {current_user.email} is NOT an admin. Role found: {current_user.profile.role}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    logger.info(f"✅ [AUTH DEBUG] User {current_user.email} authorized as admin")
    return current_user



