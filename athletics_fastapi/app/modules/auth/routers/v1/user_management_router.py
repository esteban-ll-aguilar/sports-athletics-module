from typing import Optional
from fastapi import APIRouter, Depends, status
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.auth.dependencies import get_admin_user_service
from app.modules.auth.services.admin_user_service import AdminUserService
from app.modules.auth.domain.schemas import UserRoleUpdate, PaginatedUsers
from app.modules.auth.domain.schemas import UserResponseSchema
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest

user_management_router_v1 = APIRouter()

# Ruta para listar usuarios con paginación los administradores pueden acceder
@user_management_router_v1.get("/", response_model=PaginatedUsers)
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
    return await service.get_all_users(page=page, size=size, role=role)

@user_management_router_v1.put("/{user_id}/role", response_model=UserResponseSchema)
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
    updated_user = await service.update_user_role(user_id, role_data.role)
    return UserResponseSchema.model_validate(updated_user)




