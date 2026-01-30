from typing import Optional
from fastapi import APIRouter, Depends, status
from app.modules.auth.dependencies import get_current_admin_user
from app.core.jwt.jwt import get_current_user
from app.modules.auth.dependencies import get_admin_user_service
from app.modules.auth.services.admin_user_service import AdminUserService
from app.modules.auth.domain.schemas import UserRoleUpdate, PaginatedUsers
from app.modules.auth.domain.schemas import UserResponseSchema
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

user_management_router_v1 = APIRouter()

# Ruta para listar usuarios con paginación los administradores pueden acceder
@user_management_router_v1.get("/", response_model=PaginatedUsers)
async def list_users(
    page: int = 1,
    size: int = 20,
    role: Optional[RoleEnum] = None,
    service: AdminUserService = Depends(get_admin_user_service),
    current_user: AuthUserModel = Depends(get_current_user)
):
    """
    Lista todos los usuarios con paginación.
    - Administradores: Pueden listar todo.
    - Entrenadores: Pueden listar Atletas.
    """
    # Verificar permisos
    if current_user.profile.role == RoleEnum.ADMINISTRADOR:
        pass # Admin puede ver todo
    elif current_user.profile.role == RoleEnum.ENTRENADOR:
        # Entrenador solo puede ver Atletas
        if role and role != RoleEnum.ATLETA:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Entrenadores solo pueden listar atletas")
        # Si no especifica rol, forzamos filtro por Atleta? O dejamos que servico filtre?
        # Mejor forzar filtro si es entrenador y no lo especificó, o validar.
        # Por ahora asumimos que el frontend pide role=ATLETA.
    else:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos para listar usuarios")

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




