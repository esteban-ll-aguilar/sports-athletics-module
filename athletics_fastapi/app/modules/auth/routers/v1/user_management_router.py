from typing import Optional
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.auth.dependencies import get_admin_user_service
from app.modules.auth.services.admin_user_service import AdminUserService
from app.modules.auth.domain.schemas import UserRoleUpdate, PaginatedUsers
from app.modules.auth.domain.schemas import UserResponseSchema
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest
from app.api.schemas.api_schemas import APIResponse

user_management_router_v1 = APIRouter()

# Ruta para listar usuarios con paginación los administradores pueden acceder
@user_management_router_v1.get("/", response_model=APIResponse[PaginatedUsers])
async def list_users(
    page: int = 1,
    size: int = 20,
    role: Optional[RoleEnum] = None,
    service: AdminUserService = Depends(get_admin_user_service),
    current_admin: AuthUserModel = Depends(get_current_admin_user)
):
    """
    Lista todos los usuarios con paginación.
    Solo accesible por administradores.
    """
    paginated_data = await service.get_all_users(page=page, size=size, role=role)
    return APIResponse(
        success=True,
        message="Usuarios obtenidos correctamente",
        data=paginated_data
    )

@user_management_router_v1.put("/{user_id}/role", response_model=APIResponse[UserResponseSchema])
async def update_user_role(
    user_id: str,
    role_data: UserRoleUpdate,
    service: AdminUserService = Depends(get_admin_user_service),
    current_admin: AuthUserModel = Depends(get_current_admin_user)
):
    """
    Actualiza el rol de un usuario.
    Solo accesible por administradores.
    """
    result = await service.update_user_role(user_id, role_data.role)
    
    if not result.get("success"):
        return JSONResponse(
            status_code=result.get("status_code", status.HTTP_400_BAD_REQUEST),
            content=APIResponse(
                success=False,
                message=result.get("message", "Error al actualizar rol"),
                data=None
            ).model_dump()
        )
    
    return APIResponse(
        success=True,
        message="Rol actualizado exitosamente",
        data=UserResponseSchema.model_validate(result["user"])
    )
