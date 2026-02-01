"""
External Test Router - No Rate Limiting
Provides external service endpoints without rate limiting for testing.
"""
from fastapi import APIRouter, Depends, status
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.api.schemas.api_schemas import APIResponse
from app.modules.external.services.external_users_api_service import ExternalUsersApiService
from pydantic import BaseModel

router = APIRouter(prefix="/external")


class TokenUpdateRequest(BaseModel):
    token: str


@router.post("/update-token", response_model=APIResponse)
async def update_external_token(
    data: TokenUpdateRequest,
    current_user: AuthUserModel = Depends(get_current_user),
):
    """TEST: Update external service token"""
    external_service = ExternalUsersApiService()
    result = await external_service.update_token(data.token)
    
    return APIResponse(
        success=result["success"],
        message=f"{result['message']} (TEST)",
        data=result.get("data")
    )


@router.get("/users", response_model=APIResponse)
async def list_external_users(
    current_user: AuthUserModel = Depends(get_current_user),
):
    """TEST: List users from external service"""
    external_service = ExternalUsersApiService()
    result = await external_service.get_users()
    
    return APIResponse(
        success=result["success"],
        message=f"{result['message']} (TEST)",
        data=result.get("data")
    )
