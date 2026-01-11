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


@admin_router.get("/jwt/rotation-info", response_model=RotationInfoResponse)
async def get_jwt_rotation_info(
    current_user: AuthUserModel = Depends(get_current_user)
):
    """
    Obtiene información sobre el estado de rotación de JWT secrets.
    Solo accesible por usuarios autenticados (considerar agregar rol admin).
    """
    rotation = JWTSecretRotation()
    info = rotation.get_rotation_info()
    
    logger.info(f"Usuario {current_user.email} consultó info de rotación JWT")
    
    return RotationInfoResponse(
        initialized=info.get('initialized', False),
        current_secret_age_days=info.get('current_secret_age_days'),
        days_until_rotation=info.get('days_until_rotation'),
        should_rotate=info.get('should_rotate', False),
        total_valid_secrets=info.get('total_valid_secrets', 0),
        message=info.get('message')
    )


@admin_router.post("/jwt/rotate-secret", response_model=RotationResponse)
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
    rotation = JWTSecretRotation()
    
    # Verificar si ya se inicializó
    if not rotation.get_rotation_info().get('initialized'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sistema de rotación no inicializado"
        )
    
    # Realizar rotación
    result = rotation.rotate()
    
    logger.warning(f"🔄 JWT Secret rotado manualmente por usuario: {current_user.email}")
    
    return RotationResponse(
        success=True,
        message="Secret rotado exitosamente. Los tokens antiguos son válidos por 30 días más.",
        rotated_at=result['rotated_at'],
        new_secret_preview=result['new_secret'][:10] + "..."
    )
