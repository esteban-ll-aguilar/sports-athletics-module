"""
Endpoints administrativos para gestión del sistema.
Solo accesibles por administradores.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.jwt.jwt import get_current_user
from app.core.jwt.secret_rotation import JWTSecretRotation
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.core.logging.logger import logger
from pydantic import BaseModel
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler


admin_router = APIRouter()


class RotationInfoResponse(BaseModel):
    """Información sobre el estado de rotación de secrets."""
    initialized: bool
    current_secret_age_days: int | None = None
    days_until_rotation: int | None = None
    should_rotate: bool
    total_valid_secrets: int
    message: str | None = None


class RotationResponse(BaseModel):
    """Respuesta al rotar secrets."""
    success: bool
    message: str
    rotated_at: str
    new_secret_preview: str  # Primeros 10 caracteres


@admin_router.get("/jwt/rotation-info", response_model=BaseResponse)
async def get_jwt_rotation_info(
    current_user: AuthUserModel = Depends(get_current_user)
):
    """
    Obtiene información sobre el estado de rotación de JWT secrets.
    Solo accesible por usuarios autenticados (considerar agregar rol admin).
    """
    try:
        rotation = JWTSecretRotation()
        info = rotation.get_rotation_info()
        
        logger.info(f"Usuario {current_user.email} consultó info de rotación JWT")
        
        response_data = RotationInfoResponse(
            initialized=info.get('initialized', False),
            current_secret_age_days=info.get('current_secret_age_days'),
            days_until_rotation=info.get('days_until_rotation'),
            should_rotate=info.get('should_rotate', False),
            total_valid_secrets=info.get('total_valid_secrets', 0),
            message=info.get('message')
        ).model_dump()

        return ResponseHandler.success_response(
            summary="Información de rotación obtenida",
            message="Estado de rotación de JWT obtenido correctamente",
            data=response_data
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener información de rotación",
            message=str(e)
        )


@admin_router.post("/jwt/rotate-secret", response_model=BaseResponse)
async def rotate_jwt_secret(
    current_user: AuthUserModel = Depends(get_current_user)
):
    """
    Rota el JWT secret manualmente.
    
    ⚠️ IMPORTANTE: 
    - Los tokens existentes seguirán válidos durante 30 días (período de gracia)
    - Los nuevos tokens se firmarán con el nuevo secret
    - Ejecutar solo cuando sea necesario o cada 90 días
    
    Solo accesible por usuarios autenticados (considerar agregar rol admin).
    """
    try:
        rotation = JWTSecretRotation()
        
        # Verificar si ya se inicializó
        if not rotation.get_rotation_info().get('initialized'):
             return ResponseHandler.error_response(
                summary="Error de rotación",
                message="Sistema de rotación no inicializado",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Realizar rotación
        result = rotation.rotate()
        
        logger.warning(f"🔄 JWT Secret rotado manualmente por usuario: {current_user.email}")
        
        response_data = RotationResponse(
            success=True,
            message="Secret rotado exitosamente. Los tokens antiguos son válidos por 30 días más.",
            rotated_at=result['rotated_at'],
            new_secret_preview=result['new_secret'][:10] + "..."
        ).model_dump()

        return ResponseHandler.success_response(
            summary="Rotación exitosa",
            message="JWT Secret rotado correctamente",
            data=response_data
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error en rotación de secret",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
