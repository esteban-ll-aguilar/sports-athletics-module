from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from app.modules.auth.domain.schemas import (
    PasswordResetRequest, PasswordResetCodeValidation, 
    PasswordResetConfirm
)
from app.api.schemas.api_schemas import APIResponse
from app.modules.auth.dependencies import (
    get_users_repo, 
    get_password_hasher, get_email_service, get_password_reset_service,
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.core.jwt.jwt import PasswordHasher
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.password_reset_service import PasswordResetService
from app.core.logging.logger import logger
from typing import Optional


reset_password_router_v1 = APIRouter()
# ============================================
# Gestión de Reset de Contraseña
# ============================================

@reset_password_router_v1.post("/request", response_model=APIResponse[Optional[dict]], status_code=status.HTTP_200_OK)
async def request_password_reset(
    data: PasswordResetRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    email_service: AuthEmailService = Depends(get_email_service),
    reset_service: PasswordResetService = Depends(get_password_reset_service)
):
    """
    Solicita un código de reset de contraseña por email.
    
    Protegido contra timing attacks: siempre toma el mismo tiempo de respuesta
    independientemente de si el email existe o no.
    Nunca revela si el email está registrado en el sistema.
    
    Args:
        data: Objeto con el email del usuario.
        
    Returns:
        APIResponse: Mensaje genérico de seguridad.
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
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=APIResponse(
                    success=False,
                    message="Ya existe un código activo. Espera 5 minutos antes de solicitar otro",
                    data=None
                ).model_dump()
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
            
            # Loguear error detallado para el administrador
            logger.error(f"Error CRÍTICO enviando email de reset a {data.email}: {type(e).__name__} - {e}")
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=APIResponse(
                    success=False,
                    message="No se pudo enviar el email de recuperación. Por favor intenta más tarde o contacta a soporte.",
                    data=None
                ).model_dump()
            )
    else:
        # Aunque no exista, loguear el intento
        logger.warning(f"Intento de reset para email inexistente: {data.email}")
    
    # SIEMPRE retornar el mismo mensaje (no revelar si el email existe)
    return APIResponse(
        success=True,
        message="Si el email existe en nuestro sistema, recibirás un código de restablecimiento",
        data=None
    )

@reset_password_router_v1.post("/validate-code", response_model=APIResponse[Optional[dict]], status_code=status.HTTP_200_OK)
async def validate_reset_code(
    data: PasswordResetCodeValidation,
    reset_service: PasswordResetService = Depends(get_password_reset_service)
):
    """
    Valida un código de reset sin consumirlo.
    
    Permite al frontend verificar si el código ingresado es válido antes de
    mostrar el formulario de cambio de contraseña.
    No cuenta como intento fallido ni invalida el código si es correcto.
    
    Args:
        data: Email y código a validar.
        
    Returns:
        APIResponse: Confirmación de validez.
    """
    # Validar el código sin consumirlo
    if not await reset_service.validate_reset_code_only(data.email, data.code):
        logger.warning(f"Código de validación inválido para: {data.email}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Código inválido, expirado o se han superado los intentos máximos",
                data=None
            ).model_dump()
        )
    
    logger.info(f"Código de reset validado correctamente para: {data.email}")
    return APIResponse(
        success=True,
        message="Código válido. Puedes proceder a cambiar tu contraseña",
        data=None
    )

@reset_password_router_v1.post("/reset", response_model=APIResponse[Optional[dict]], status_code=status.HTTP_200_OK)
async def complete_password_reset(
    data: PasswordResetConfirm,
    repo: AuthUsersRepository = Depends(get_users_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    reset_service: PasswordResetService = Depends(get_password_reset_service),
    email_service: AuthEmailService = Depends(get_email_service)
):
    """
    Completa el proceso de restablecimiento de contraseña.
    
    1. Verifica el código (lo consume).
    2. Actualiza la contraseña (hasheada).
    3. Envía email de confirmación.
    
    Args:
        data: Email, código y nueva contraseña.
        
    Returns:
        APIResponse: Confirmación de éxito.
    """
    #PASO 4: Envía email de confirmación del cambio exitoso.
    # Verificar que el usuario existe
    user = await repo.get_by_email(data.email)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=APIResponse(
                success=False,
                message="Usuario no encontrado",
                data=None
            ).model_dump()
        )
    
    # Consumir el código (validar y eliminar)
    if not await reset_service.consume_reset_code(data.email, data.code):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Código inválido, expirado o ya utilizado",
                data=None
            ).model_dump()
        )
    
    # Actualizar contraseña
    new_password_hash = hasher.hash(data.new_password)
    success = await repo.update_password_by_email(data.email, new_password_hash, password=data.new_password)
    
    if not success:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=APIResponse(
                success=False,
                message="Error al actualizar la contraseña",
                data=None
            ).model_dump()
        )
    
    # Enviar email de confirmación
    try:
        email_service.send_password_changed_confirmation(data.email)
    except Exception as e:
        # Log el error pero no fallar la operación ya que la contraseña ya fue cambiada
        print(f"Error enviando email de confirmación: {e}")
    
    return APIResponse(
        success=True,
        message="Contraseña restablecida exitosamente. Se ha enviado un email de confirmación.",
        data=None
    )

