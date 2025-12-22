from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.modules.admin.domain.schemas import (
    MessageResponse,
    EmailVerificationRequest, ResendVerificationRequest,
)
from app.modules.auth.dependencies import (
    get_users_repo, get_email_service,
    get_email_verification_service
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.admin.services.auth_email_service import AuthEmailService
from app.modules.admin.services.email_verification_service import EmailVerificationService
from app.core.logging.logger import logger
from app.modules.modules import APP_TAGS_V1

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_email_router_v1 = APIRouter()


# ============================================
# Verificación de Email
# ============================================

@auth_email_router_v1.post("/verify", response_model=MessageResponse)
@limiter.limit("10/hour")  # Limitar intentos de verificación
async def verify_email(
    request: Request,
    data: EmailVerificationRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    verification_service: EmailVerificationService = Depends(get_email_verification_service)
):
    """
    Activa la cuenta si el código es correcto a través del codigo OTP enviado por el email.

    """
    # Validar el código
    is_valid = await verification_service.validate_verification_code(data.email, data.code)
    
    if not is_valid:
        logger.warning(f"Intento fallido de verificación de email: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido, expirado o se superaron los intentos máximos"
        )
    
    # Activar usuario
    activated = await repo.activate_user(data.email)
    
    if not activated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    logger.info(f"Email verificado y usuario activado: {data.email}")
    return MessageResponse(message="Email verificado exitosamente. Tu cuenta ha sido activada.")


@auth_email_router_v1.post("/resend-verification", response_model=MessageResponse)
@limiter.limit("3/hour")  # Limitar reenvíos
async def resend_verification_code(
    request: Request,
    data: ResendVerificationRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    email_service: AuthEmailService = Depends(get_email_service),
    verification_service: EmailVerificationService = Depends(get_email_verification_service)
):
    """
    Reenvía el código de verificación de email.
    Solo funciona si el usuario existe y no está activo aún.
    """
    user = await repo.get_by_email(data.email)
    
    if not user:
        # Por seguridad, no revelar si el email existe
        return MessageResponse(message="Si el email está registrado, recibirás un nuevo código")
    
    if user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta cuenta ya está verificada"
        )
    
    # Verificar si ya existe un código activo
    if await verification_service.code_exists(data.email):
        remaining = await verification_service.get_remaining_time(data.email)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Ya existe un código activo. Espera {remaining // 60} minutos"
        )
    
    # Generar y enviar nuevo código
    code = verification_service.generate_verification_code()
    await verification_service.store_verification_code(data.email, code)
    
    try:
        email_service.send_email_verification_code(data.email, code)
        logger.info(f"Código de verificación reenviado a: {data.email}")
    except Exception as e:
        await verification_service.delete_verification_code(data.email)
        logger.error(f"Error reenviando código a {data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al enviar el email"
        )
    
    return MessageResponse(message="Nuevo código de verificación enviado al email")
