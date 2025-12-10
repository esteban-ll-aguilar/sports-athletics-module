from fastapi import APIRouter, Depends, status
from app.modules.auth.domain.schemas.schemas_user_list import UsersPaginatedResponse
from app.modules.auth.domain.schemas.schemas_auth import UserRead
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.dependencies import get_users_repo

users_list_router_v1 = APIRouter()

@users_list_router_v1.get(
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
