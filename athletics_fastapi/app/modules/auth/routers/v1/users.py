from fastapi import APIRouter, Depends, status, Form, File, UploadFile, HTTPException
from typing import Optional
from uuid import UUID
import math
from datetime import date

from app.modules.auth.domain.schemas import (
    PaginatedUsersWithRelations,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserWithRelationsSchema
)

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo, get_current_user
# from app.public.schemas import BaseResponse # Import removed
from app.modules.auth.domain.models import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum, SexoEnum
from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum
from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
from app.modules.common.services.file_service import FileService
from app.core.logging.logger import logger
from app.api.schemas.api_schemas import APIResponse

users_router_v1 = APIRouter()

# ======================================================
# CREATE USER
# ======================================================

@users_router_v1.post(
    "/users",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario"
)
async def create_user(
    user_data: UserCreateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    """
    Crea un nuevo usuario básico.
    
    Esta función es similar al register pero destinada a uso interno o administrativo
    donde se pasan todos los datos directamente.
    
    Args:
        user_data: Datos del usuario a crear.
        
    Returns:
        APIResponse: Usuario creado.
    """
    try:
        user = await repo.create_user(user_data)

        return APIResponse(
            success=True,
            message="Usuario creado exitosamente",
            data=UserResponseSchema.model_validate(
                user,
                from_attributes=True
            ).model_dump()
        )
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ======================================================
# LIST USERS (PAGINATED)
# ======================================================

@users_router_v1.get(
    "/list",
    response_model=APIResponse[PaginatedUsersWithRelations],
    status_code=status.HTTP_200_OK,
    summary="Lista paginada de usuarios"
)
async def list_users(
    page: int = 1,
    page_size: int = 10,
    role: Optional[RoleEnum] = None,
    repo: AuthUsersRepository = Depends(get_users_repo),
    _: AuthUserModel = Depends(get_current_user)
):
    """
    Obtiene lista paginada de usuarios con sus relaciones (perfiles).
    
    Args:
        page: Número de página.
        page_size: Cantidad por página.
        role: Filtro por rol (opcional).
        
    Returns:
        APIResponse: Lista paginada con metadatos.
    """
    users, total = await repo.get_paginated(
        page=page,
        size=page_size,
        role=role
    )

    pages = math.ceil(total / page_size)

    return APIResponse(
        success=True,
        message="Usuarios listados correctamente",
        data=PaginatedUsersWithRelations(
            total=total,
            page=page,
            size=page_size,
            pages=pages,
            items=[
                UserWithRelationsSchema.model_validate(
                    user,
                    from_attributes=True
                )
                for user in users
            ]
        )
    )

# ======================================================
# GET CURRENT USER (ME) - MOVED UP TO AVOID CONFLICT
# ======================================================

@users_router_v1.get(
    "/me",
    response_model=APIResponse[UserWithRelationsSchema],
    status_code=status.HTTP_200_OK,
    summary="Obtener perfil del usuario actual"
)
async def get_current_user_profile(
    current_user: AuthUserModel = Depends(get_current_user),
):
    """
    Obtiene el perfil completo del usuario actualmente autenticado.
    
    Incluye las relaciones cargadas (auth, entrenador, atleta, etc.).
    
    Args:
        current_user: Usuario obtenido del token JWT.
        
    Returns:
        APIResponse: Datos del perfil del usuario.
    """
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado"
        )

    return APIResponse(
        success=True,
        message="Perfil obtenido exitosamente",
        data=UserWithRelationsSchema.model_validate(
            current_user.profile,
            from_attributes=True
        ).model_dump()
    )

# ======================================================
# UPDATE MY PROFILE (With File Upload) - MOVED UP TO AVOID CONFLICT
# ======================================================

@users_router_v1.put(
    "/me",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Actualizar perfil del usuario actual"
)
async def update_profile(
    username: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone: Optional[str] = Form(None),
    direccion: Optional[str] = Form(None),
    sexo: Optional[str] = Form(None), # Enum as string from form
    tipo_estamento: Optional[str] = Form(None), # Enum as string from form
    fecha_nacimiento: Optional[str] = Form(None), # Date as string from form
    tipo_identificacion: Optional[str] = Form(None),
    identificacion: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),

    current_user: AuthUserModel = Depends(get_current_user),
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    """
    Endpoint para que el usuario actual actualice su propio perfil.
    
    Acepta `multipart/form-data` para permitir la subida de una nueva imagen de perfil.
    Actualiza campos básicos y específicos del rol si aplica.
    
    Args:
        username, first_name, last_name, etc.: Campos del formulario.
        profile_image: Archivo de imagen opcional.
        current_user: Usuario autenticado.
        
    Returns:
        APIResponse: Perfil actualizado.
    """
    user = current_user.profile
    if not user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil no encontrado"
        )

    # =========================
    # ACTUALIZAR CAMPOS
    # =========================
    user.username = username
    user.first_name = first_name
    user.last_name = last_name
    user.phone = phone
    user.direccion = direccion
    user.identificacion = identificacion
    
    if sexo:
        try:
            user.sexo = SexoEnum(sexo)
        except ValueError:
            pass 
            
    if tipo_estamento:
        try:
            user.tipo_estamento = TipoEstamentoEnum(tipo_estamento)
        except ValueError:
            pass

    if tipo_identificacion:
        try:
            user.tipo_identificacion = TipoIdentificacionEnum(tipo_identificacion)
        except ValueError:
            pass

    if fecha_nacimiento:
        try:
             user.fecha_nacimiento = date.fromisoformat(fecha_nacimiento)
        except ValueError:
             pass

    # =========================
    # IMAGEN
    # =========================
    if profile_image:
        file_service = FileService(base_dir="data")
        saved_path = await file_service.save_profile_picture(profile_image)
        user.profile_image = saved_path

    await repo.commit()
    await repo.refresh(user)

    return APIResponse(
        success=True,
        message="Perfil actualizado correctamente",
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump()
    )
# GET USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.get(
    "/users/{external_id}",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Obtener usuario por external_id"
)
async def get_user_by_external_id(
    external_id: UUID,
    repo: AuthUsersRepository = Depends(get_users_repo),
    _: AuthUserModel = Depends(get_current_user),  # protección JWT
):
    """
    Busca un usuario por su ID externo (UUID).
    
    Útil para integraciones con sistemas legacy o externos que usan este ID.
    
    Args:
        external_id: UUID del usuario externo.
        
    Returns:
        APIResponse: Usuario encontrado.
    """
    try:
        user = await repo.get_by_external_id(external_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
    except Exception as e:
        logger.error(f"Error fetching user by external_id: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

    return APIResponse(
        success=True,
        message="Usuario encontrado exitosamente",
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump()
    )

# ======================================================
# UPDATE USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.put(
    "/{user_id}",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Actualizar usuario por external_id o ID interno"
)
async def update_user_by_id(
    user_id: str,
    user_data: UserUpdateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    current_user: AuthUserModel = Depends(get_current_user),
):
    """
    Actualiza un usuario específico por su ID (interno o externo).
    
    Implementa control de acceso (RBAC):
    - ADMIN: Puede editar a cualquiera.
    - ENTRENADOR: Puede editar a sus Atletas (regla de negocio: 'is_coach_editing_athlete').
    - PROPIO USUARIO: Puede editarse a sí mismo.
    
    Args:
        user_id: ID del usuario a editar.
        user_data: Datos a actualizar.
        current_user: Quien realiza la petición.
        
    Returns:
        APIResponse: Usuario actualizado.
    """
    try:
        # Buscar usuario (UUID o ID interno) usando el repo helper
        user = await repo.get_by_any_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
    except Exception as e:
        logger.error(f"Error fetching user by ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

    is_self = current_user.profile.id == user.id
    current_role = current_user.profile.role.value if hasattr(current_user.profile.role, "value") else current_user.profile.role
    target_role = user.role.value if hasattr(user.role, "value") else user.role
    is_admin = (current_role == RoleEnum.ADMINISTRADOR.value)
    is_coach_editing_athlete = (current_role == RoleEnum.ENTRENADOR.value and target_role == RoleEnum.ATLETA.value)

    if not (is_self or is_admin or is_coach_editing_athlete):
        logger.warning(f"🚫 [AUTH] Access denied: User {current_user.email} (Role: {current_role}) cannot update User {user.id} (Role: {target_role})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para editar este usuario"
        )

    updated_user = await repo.update(
        user=user,
        user_data=user_data
    )

    return APIResponse(
        success=True,
        message="Usuario actualizado correctamente",
        data=UserResponseSchema.model_validate(updated_user).model_dump()
    )
