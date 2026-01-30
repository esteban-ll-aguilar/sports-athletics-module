from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.api.schemas.api_schemas import APIResponse
from app.modules.auth.domain.schemas import (
    MessageResponse,
    EmailVerificationRequest, ResendVerificationRequest,
)
from app.modules.auth.dependencies import (
    get_users_repo, get_email_service,
    get_email_verification_service
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.email_verification_service import EmailVerificationService
from app.core.logging.logger import logger

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_email_router_v1 = APIRouter()

@auth_email_router_v1.post("/verify", response_model=APIResponse[MessageResponse])
@limiter.limit("10/hour")  # Limitar intentos de verificación
async def verify_email(
    request: Request,
    data: EmailVerificationRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    verification_service: EmailVerificationService = Depends(get_email_verification_service)
):
    """
    Verifica el correo electrónico mediante el código OTP enviado.
    
    Si el código es válido, activa la cuenta del usuario.
    
    Args:
        request: Request object.
        data: Objeto con email y código de verificación.
        
    Returns:
        APIResponse: Mensaje de éxito.
    """
    # Validar el código
    is_valid = await verification_service.validate_verification_code(data.email, data.code)
    
    if not is_valid:
        logger.warning(f"Intento fallido de verificación de email: {data.email}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Código inválido, expirado o se superaron los intentos máximos"
            ).model_dump()
        )
    
    # Activar usuario
    activated = await repo.activate_user(data.email)
    
    if not activated:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(
                success=False,
                message="Usuario no encontrado"
            ).model_dump()
        )
    
    logger.info(f"Email verificado y usuario activado: {data.email}")
    return APIResponse(
        success=True,
        message="Email verificado exitosamente. Tu cuenta ha sido activada.",
        data=MessageResponse(message="Email verificado exitosamente. Tu cuenta ha sido activada.")
    )


@auth_email_router_v1.post("/resend-verification", response_model=APIResponse[MessageResponse])
@limiter.limit("3/hour")  # Limitar reenvíos
async def resend_verification_code(
    request: Request,
    data: ResendVerificationRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    email_service: AuthEmailService = Depends(get_email_service),
    verification_service: EmailVerificationService = Depends(get_email_verification_service)
):
    """
    Solicita un nuevo código de verificación de email.
    
    Solo funciona para usuarios registrados pero inactivos.
    Implementa rate limiting para evitar abuso.
    
    Args:
        request: Request object.
        data: Objeto con el email.
        
    Returns:
        APIResponse: Confirmación de envío (o mensaje seguro si no existe).
    """
    user = await repo.get_by_email(data.email)
    
    if not user:
        # Por seguridad, no revelar si el email existe
        return APIResponse(
            success=True,
            message="Si el email está registrado, recibirás un nuevo código",
            data=MessageResponse(message="Si el email está registrado, recibirás un nuevo código")
        )
    
    if user.is_active:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Esta cuenta ya está verificada"
            ).model_dump()
        )
    
    # Verificar si ya existe un código activo
    if await verification_service.code_exists(data.email):
        remaining = await verification_service.get_remaining_time(data.email)
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=APIResponse(
                success=False,
                message=f"Ya existe un código activo. Espera {remaining // 60} minutos"
            ).model_dump()
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
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=APIResponse(
                success=False,
                message="Error al enviar el email"
            ).model_dump()
        )
    
    return APIResponse(
        success=True,
        message="Nuevo código de verificación enviado al email",
        data=MessageResponse(message="Nuevo código de verificación enviado al email")
    )
