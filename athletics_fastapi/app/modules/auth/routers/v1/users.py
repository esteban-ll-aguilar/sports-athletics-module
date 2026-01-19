from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID
from fastapi import Form, File, UploadFile
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
import os, shutil
import math


from app.modules.auth.domain.schemas import (
    PaginatedUsers,
    PaginatedUsersWithRelations,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserWithRelationsSchema
)

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo, get_current_user
from app.public.schemas import BaseResponse
from app.modules.auth.domain.models import AuthUserModel, UserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.modules.auth.domain.enums.role_enum import SexoEnum
from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum
from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
from datetime import date




users_router_v1 = APIRouter()

# ======================================================
# CREATE USER
# ======================================================

@users_router_v1.post(
    "/users",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario"
)
async def create_user(
    user_data: UserCreateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    user = await repo.create_user(user_data)

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump(),
        message="Usuario creado exitosamente",
        status=status.HTTP_201_CREATED
    )

# ======================================================
# LIST USERS (PAGINATED)
# ======================================================

@users_router_v1.get(
    "/list",
    response_model=PaginatedUsers,
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
    users, total = await repo.get_paginated(
        page=page,
        size=page_size,
        role=role
    )

    pages = math.ceil(total / page_size)

    return PaginatedUsersWithRelations(
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

# ======================================================
# GET USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.get(
    "/users/{external_id}",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener usuario por external_id"
)
async def get_user_by_external_id(
    external_id: UUID,
    repo: AuthUsersRepository = Depends(get_users_repo),
    _: AuthUserModel = Depends(get_current_user),  # protección JWT
):
    user = await repo.get_by_external_id(external_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump(),
        message="Usuario encontrado exitosamente",
        status=status.HTTP_200_OK
    )

# ======================================================
# UPDATE USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.put(
    "/{user_id}",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar usuario por external_id o ID interno"
)
async def update_user_by_id(
    user_id: str,
    user_data: UserUpdateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    current_user: AuthUserModel = Depends(get_current_user),
):
    # Buscar usuario (UUID o ID interno) usando el repo helper
    user = await repo.get_by_any_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    from app.core.logging.logger import logger
    
    # 🔒 Autorización: El usuario puede editarse a sí mismo, o ser Administrador, o Entrenador editando Atleta
    is_self = current_user.profile.id == user.id
    
    # Usamos .value para asegurar comparación de strings si son Enums
    current_role = current_user.profile.role.value if hasattr(current_user.profile.role, "value") else current_user.profile.role
    target_role = user.role.value if hasattr(user.role, "value") else user.role
    
    is_admin = (current_role == RoleEnum.ADMINISTRADOR.value)
    is_coach_editing_athlete = (current_role == RoleEnum.ENTRENADOR.value and target_role == RoleEnum.ATLETA.value)
    
    logger.info(f"🔐 [AUTH DEBUG] Update attempt: CurrentUser(id={current_user.profile.id}, role={current_role}) -> TargetUser(id={user.id}, role={target_role})")
    logger.info(f"🔐 [AUTH DEBUG] Checks: self={is_self}, admin={is_admin}, coach_on_athlete={is_coach_editing_athlete}")

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

    return BaseResponse(
        data=UserResponseSchema.model_validate(updated_user).model_dump(),
        message="Usuario actualizado correctamente",
        status=status.HTTP_200_OK
    )


# ======================================================
# GET CURRENT USER (ME)
# ======================================================

@users_router_v1.get(
    "/me",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener perfil del usuario actual"
)
async def get_current_user_profile(
    current_user: AuthUserModel = Depends(get_current_user),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado"
        )

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            current_user.profile,
            from_attributes=True
        ).model_dump(),
        message="Perfil obtenido exitosamente",
        status=status.HTTP_200_OK
    )

# ======================================================
from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID
import math

from app.modules.auth.domain.schemas import (
    PaginatedUsers,
    PaginatedUsersWithRelations,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserWithRelationsSchema
)

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo, get_current_user
from app.public.schemas import BaseResponse
from app.modules.auth.domain.models import AuthUserModel, UserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
from sqlalchemy import select
from sqlalchemy.orm import selectinload


users_router_v1 = APIRouter()

# ======================================================
# CREATE USER
# ======================================================

@users_router_v1.post(
    "/users",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario"
)
async def create_user(
    user_data: UserCreateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    user = await repo.create_user(user_data)

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump(),
        message="Usuario creado exitosamente",
        status=status.HTTP_201_CREATED
    )

# ======================================================
# LIST USERS (PAGINATED)
# ======================================================

@users_router_v1.get(
    "/list",
    response_model=PaginatedUsers,
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
    users, total = await repo.get_paginated(
        page=page,
        size=page_size,
        role=role
    )

    pages = math.ceil(total / page_size)

    return PaginatedUsersWithRelations(
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

# ======================================================
# GET USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.get(
    "/users/{external_id}",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener usuario por external_id"
)
async def get_user_by_external_id(
    external_id: UUID,
    repo: AuthUsersRepository = Depends(get_users_repo),
    _: AuthUserModel = Depends(get_current_user),  # protección JWT
):
    user = await repo.get_by_external_id(external_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            user,
            from_attributes=True
        ).model_dump(),
        message="Usuario encontrado exitosamente",
        status=status.HTTP_200_OK
    )

# ======================================================
# UPDATE USER BY EXTERNAL_ID
# ======================================================

@users_router_v1.put(
    "/{user_id}",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar usuario por external_id o ID interno"
)
async def update_user_by_id(
    user_id: str,
    user_data: UserUpdateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    current_user: AuthUserModel = Depends(get_current_user),
):
    # Buscar usuario (UUID o ID interno) usando el repo helper
    user = await repo.get_by_any_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    from app.core.logging.logger import logger
    
    # 🔒 Autorización: El usuario puede editarse a sí mismo, o ser Administrador, o Entrenador editando Atleta
    is_self = current_user.profile.id == user.id
    
    # Usamos .value para asegurar comparación de strings si son Enums
    current_role = current_user.profile.role.value if hasattr(current_user.profile.role, "value") else current_user.profile.role
    target_role = user.role.value if hasattr(user.role, "value") else user.role
    
    is_admin = (current_role == RoleEnum.ADMINISTRADOR.value)
    is_coach_editing_athlete = (current_role == RoleEnum.ENTRENADOR.value and target_role == RoleEnum.ATLETA.value)
    
    logger.info(f"🔐 [AUTH DEBUG] Update attempt: CurrentUser(id={current_user.profile.id}, role={current_role}) -> TargetUser(id={user.id}, role={target_role})")
    logger.info(f"🔐 [AUTH DEBUG] Checks: self={is_self}, admin={is_admin}, coach_on_athlete={is_coach_editing_athlete}")

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

    return BaseResponse(
        data=UserResponseSchema.model_validate(updated_user).model_dump(),
        message="Usuario actualizado correctamente",
        status=status.HTTP_200_OK
    )


# ======================================================
# GET CURRENT USER (ME)
# ======================================================

@users_router_v1.get(
    "/me",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener perfil del usuario actual"
)
async def get_current_user_profile(
    current_user: AuthUserModel = Depends(get_current_user),
):
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado"
        )

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            current_user.profile,
            from_attributes=True
        ).model_dump(),
        message="Perfil obtenido exitosamente",
        status=status.HTTP_200_OK
    )

# ======================================================
@users_router_v1.put("/users/me")
async def update_me(
    user_data: UserUpdateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    user = current_user.profile
    updated = await repo.update(user, user_data)
    return updated

@users_router_v1.put("/users/me/profile-image")
async def update_profile_image(
    profile_image: UploadFile = File(...),
    current_user: AuthUserModel = Depends(get_current_user),
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    os.makedirs("media/profiles", exist_ok=True)

    filename = f"user_{current_user.profile.id}.jpg"
    path = f"media/profiles/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(profile_image.file, buffer)

    current_user.profile.profile_image = path
    await repo.update_profile(current_user.profile)

    return {"profile_image": path}
