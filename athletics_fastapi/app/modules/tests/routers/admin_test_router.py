"""
Admin Test Router - No Rate Limiting
Provides admin endpoints without rate limiting for testing.
"""
from fastapi import APIRouter, Depends, status
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.api.schemas.api_schemas import APIResponse
from app.core.jwt.secret_rotation import JWTSecretRotation

router = APIRouter(prefix="/admin")


@router.get("/jwt/rotation-info", response_model=APIResponse)
async def get_jwt_rotation_info(
    current_user: AuthUserModel = Depends(get_current_user),
):
    """TEST: Get JWT rotation information"""
    rotation_service = JWTSecretRotation()
    info = await rotation_service.get_rotation_info()
    
    return APIResponse(
        success=True,
        message="JWT rotation info obtenida (TEST)",
        data=info
    )


@router.post("/jwt/rotate", response_model=APIResponse)
async def manual_rotate_jwt(
    current_user: AuthUserModel = Depends(get_current_user),
):
    """TEST: Manually rotate JWT secret"""
    rotation_service = JWTSecretRotation()
    result = await rotation_service.rotate()
    
    return APIResponse(
        success=result["success"],
        message=f"{result['message']} (TEST)",
        data=result.get("data")
    )
