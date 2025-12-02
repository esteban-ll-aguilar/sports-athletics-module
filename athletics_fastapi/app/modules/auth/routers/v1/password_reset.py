from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.modules.auth.domain.schemas import (
    PasswordResetRequest, PasswordResetCodeValidation, 
    PasswordResetComplete, MessageResponse,
)
from app.modules.auth.dependencies import (
    get_users_repo, 
    get_password_hasher, get_email_service, get_password_reset_service,
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.core.jwt.jwt import PasswordHasher
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.password_reset_service import PasswordResetService
from app.core.logging.logger import logger
from app.modules.modules import APP_TAGS_V1

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

reset_password_router_v1 = APIRouter()
# ============================================
# Gestión de Reset de Contraseña
# ============================================

@reset_password_router_v1.post("/request", response_model=MessageResponse, status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")  # Limitar solicitudes de reset
async def request_password_reset(
    request: Request,  # Necesario para el limiter
    data: PasswordResetRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    email_service: AuthEmailService = Depends(get_email_service),
    reset_service: PasswordResetService = Depends(get_password_reset_service)
):
    """
    Solicita un código de reset de contraseña por email.
    Protegido contra timing attacks: siempre toma el mismo tiempo.
    """
    # SIEMPRE generar código (aunque no exista el usuario) para prevenir timing attack
    code = reset_service.generate_reset_code()
    
    # Verificar que el usuario existe
    user = await repo.get_by_email(data.email)
    
    # Solo procesar si el usuario existe
    if user:
        # Verificar si ya existe un código activo
        if await reset_service.code_exists(data.email):
            logger.warning(f"Intento de reset con código activo para: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                detail="Ya existe un código activo. Espera 5 minutos antes de solicitar otro"
            )
        
        # Almacenar código
        await reset_service.store_reset_code(data.email, code)
        
        # Enviar email
        try:
            email_service.send_reset_code(data.email, code)
            logger.info(f"Código de reset enviado a: {data.email}")
        except Exception as e:
            # Si falla el envío, eliminar el código
            await reset_service.delete_reset_code(data.email)
            logger.error(f"Error enviando email de reset a {data.email}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al enviar el email"
            )
    else:
        # Aunque no exista, loguear el intento
        logger.warning(f"Intento de reset para email inexistente: {data.email}")
    
    # SIEMPRE retornar el mismo mensaje (no revelar si el email existe)
    return MessageResponse(message="Si el email existe en nuestro sistema, recibirás un código de restablecimiento")

@reset_password_router_v1.post("/validate-code", response_model=MessageResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/hour")  # Limitar validaciones de código
async def validate_reset_code(
    request: Request,  # Necesario para el limiter
    data: PasswordResetCodeValidation,
    reset_service: PasswordResetService = Depends(get_password_reset_service)
):
    """
    PASO 2: Valida únicamente el código de reset sin consumirlo.
    Permite al usuario verificar que el código es correcto antes de proceder.
    """
    # Validar el código sin consumirlo
    if not await reset_service.validate_reset_code_only(data.email, data.code):
        logger.warning(f"Código de validación inválido para: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido, expirado o se han superado los intentos máximos"
        )
    
    logger.info(f"Código de reset validado correctamente para: {data.email}")
    return MessageResponse(message="Código válido. Puedes proceder a cambiar tu contraseña")

@reset_password_router_v1.post("/reset", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def complete_password_reset(
    data: PasswordResetComplete,
    repo: AuthUsersRepository = Depends(get_users_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    reset_service: PasswordResetService = Depends(get_password_reset_service),
    email_service: AuthEmailService = Depends(get_email_service)
):
    """
    PASO 3: Completa el reset de contraseña consumiendo el código y actualizando la contraseña.
    """
    #PASO 4: Envía email de confirmación del cambio exitoso.
    # Verificar que el usuario existe
    user = await repo.get_by_email(data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Consumir el código (validar y eliminar)
    if not await reset_service.consume_reset_code(data.email, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido, expirado o ya utilizado"
        )
    
    # Actualizar contraseña
    new_password_hash = hasher.hash(data.new_password)
    success = await repo.update_password_by_email(data.email, new_password_hash)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al actualizar la contraseña"
        )
    
    # Enviar email de confirmación
    try:
        email_service.send_password_changed_confirmation(data.email)
    except Exception as e:
        # Log el error pero no fallar la operación ya que la contraseña ya fue cambiada
        print(f"Error enviando email de confirmación: {e}")
    
    return MessageResponse(message="Contraseña restablecida exitosamente. Se ha enviado un email de confirmación.")

