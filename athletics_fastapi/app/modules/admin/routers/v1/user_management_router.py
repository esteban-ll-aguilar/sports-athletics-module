from fastapi import APIRouter, Depends, status
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.admin.dependencies import get_admin_user_service
from app.modules.admin.services.admin_user_service import AdminUserService
from app.modules.admin.domain.schemas import UserRoleUpdate, PaginatedUsers
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas import UserRead
from app.modules.admin.domain.schemas.schemas_auth import AdminUserUpdateRequest

user_management_router = APIRouter(prefix="/users")

# Ruta para listar usuarios con paginación los administradores pueden acceder
@user_management_router.get("/", response_model=PaginatedUsers)
async def list_users(
    page: int = 1,
    size: int = 20,
    service: AdminUserService = Depends(get_admin_user_service),
    current_admin: AuthUserModel = Depends(get_current_admin_user)
):
    """
    Lista todos los usuarios con paginación.
    Solo accesible por administradores.
    """
    return await service.get_all_users(page=page, size=size)

@user_management_router.put("/{user_id}/role", response_model=UserRead)
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
    return UserRead.model_validate(updated_user)



# Ruta para que el admin pueda actualizar datos de un usuario excepto el rol
@user_management_router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: str,
    data: AdminUserUpdateRequest,
    service: AdminUserService = Depends(get_admin_user_service),
    current_admin: AuthUserModel = Depends(get_current_admin_user)
):
    """
    Actualiza los datos de un usuario excepto el rol.
    Solo accesible por administradores.
    """
    updated_user = await service.update_user_by_id(user_id, data)
    return UserRead.model_validate(updated_user)

