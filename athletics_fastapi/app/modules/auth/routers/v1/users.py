from fastapi import APIRouter, Depends, status, HTTPException
from app.modules.auth.domain.schemas import UsersPaginatedResponse, UserRead, UserUpdateRequest, UserGet
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo, get_current_user
from app.public.schemas import BaseResponse
from app.modules.auth.domain.models import AuthUserModel

users_router_v1 = APIRouter()

@users_router_v1.get(
    "/users",
    response_model=UsersPaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Lista paginada de usuarios",
)
async def list_users(
    page: int = 1,
    page_size: int = 10,
    repo: AuthUsersRepository = Depends(get_users_repo)
):
    total, users = await repo.get_users_paginated(page=page, page_size=page_size)
    users_data = [UserRead.from_orm(user) for user in users]
    return UsersPaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        users=users_data
    )


@users_router_v1.get(
    "/user",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Detalle de un usuario",
)
async def get_user(
    data: UserGet = Depends(),
    repo: AuthUsersRepository = Depends(get_users_repo)
):
    user = await repo.get_by_external_id(data.external_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return BaseResponse(
        data=UserRead.from_orm(user).model_dump(by_alias=True),
        message="Usuario encontrado exitosamente",
        status=status.HTTP_200_OK
    )

@users_router_v1.put(
    "/user",
    response_model=BaseResponse,
    status_code=status.HTTP_200_OK,
    summary="Actualizar un usuario",
)
async def update_user(
    user_data: UserUpdateRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    current_user: AuthUserModel = Depends(get_current_user),
):
    await repo.update_user(current_user.id, user_data)
    user = await repo.get_by_id(current_user.id)
    return BaseResponse(
        data=UserRead.from_orm(user).model_dump(by_alias=True),
        message="Usuario actualizado exitosamente",
        status=status.HTTP_200_OK
    )


