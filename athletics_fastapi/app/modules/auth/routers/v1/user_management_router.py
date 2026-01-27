from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.auth.dependencies import get_admin_user_service
from app.modules.auth.services.admin_user_service import AdminUserService
from app.modules.auth.domain.schemas import UserRoleUpdate, PaginatedUsers
from app.modules.auth.domain.schemas import UserResponseSchema
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

user_management_router_v1 = APIRouter()

# Ruta para listar usuarios con paginación los administradores pueden acceder
@user_management_router_v1.get("/", response_model=BaseResponse)
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
    try:
        users_data = await service.get_all_users(page=page, size=size, role=role)
        # Serializar datos paginados
        serialized_data = PaginatedUsers.model_validate(users_data).model_dump()
        
        return ResponseHandler.success_response(
            summary="Lista de usuarios obtenida correctamente",
            message="Usuarios encontrados",
            data=serialized_data
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar usuarios",
            message=str(e)
        )

@user_management_router_v1.put("/{user_id}/role", response_model=BaseResponse)
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
    try:
        updated_user = await service.update_user_role(user_id, role_data.role)
        return ResponseHandler.success_response(
            summary="Rol del usuario actualizado correctamente",
            message="Usuario actualizado correctamente",
            data=UserResponseSchema.model_validate(updated_user).model_dump()
        )
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            return ResponseHandler.not_found_response(
                entity="Usuario",
                message="Usuario no encontrado"
            )
        return ResponseHandler.error_response(
            summary="Error al actualizar rol",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




