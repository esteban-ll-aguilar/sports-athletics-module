from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
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
    Lista todos los usuarios del sistema aplicando paginación.
    
    Reglas de acceso (Role Based Access Control):
    - Administradores: Pueden listar cualquier rol.
    - Entrenadores: Solo pueden listar usuarios con rol 'ATLETA'.
    
    Args:
        page: Número de página.
        size: Tamaño de página.
        role: Filtro opcional por rol.
        
    Returns:
        PaginatedUsers: Lista paginada de usuarios.
    """
    # Verificar permisos
    if current_user.profile.role == RoleEnum.ADMINISTRADOR:
        pass # Admin puede ver todo
    elif current_user.profile.role in [RoleEnum.ENTRENADOR, RoleEnum.PASANTE]:
        # Entrenador y Pasante solo pueden listar Atletas
        if role and role != RoleEnum.ATLETA:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Entrenadores y Pasantes solo pueden listar atletas")
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
    Actualiza el rol de un usuario existente.
    
    Operación crítica solo permitida para Administradores.
    Si el nuevo rol requiere una entidad asociada (ej. Atleta), se creará automáticamente.
    
    Args:
        user_id: ID (UUID o entero) del usuario.
        role_data: Nuevo rol.
        
    Returns:
        UserResponseSchema: Usuario actualizado.
    """
    updated_user = await service.update_user_role(user_id, role_data.role)
    return UserResponseSchema.model_validate(updated_user)




