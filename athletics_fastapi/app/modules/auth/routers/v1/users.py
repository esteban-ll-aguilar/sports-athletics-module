from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID

from app.modules.auth.domain.schemas import (
    PaginatedUsers,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema
)

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo, get_current_user
from app.public.schemas import BaseResponse
from app.modules.auth.domain.models import AuthUserModel


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
    "/users",
    response_model=PaginatedUsers,
    status_code=status.HTTP_200_OK,
    summary="Lista paginada de usuarios"
)
async def list_users(
    page: int = 1,
    page_size: int = 10,
    repo: AuthUsersRepository = Depends(get_users_repo),
):
    total, users = await repo.get_users_paginated(
        page=page,
        page_size=page_size
    )

    return PaginatedUsers(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            UserResponseSchema.model_validate(
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
    "/users/{external_id}",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar usuario por external_id"
)
async def update_user_by_external_id(
    external_id: UUID,
    user_data: UserUpdateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    _: AuthUserModel = Depends(get_current_user),
):
    user = await repo.get_by_external_id(external_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    await repo.update_user(
        user_id=user.id,
        user_data=user_data
    )

    updated_user = await repo.get_by_id(user.id)

    return BaseResponse(
        data=UserResponseSchema.model_validate(
            updated_user,
            from_attributes=True
        ).model_dump(),
        message="Usuario actualizado exitosamente",
        status=status.HTTP_200_OK
    )
