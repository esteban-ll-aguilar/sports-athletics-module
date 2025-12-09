from fastapi import Depends
from app.modules.auth.dependencies import get_users_repo
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.admin.services.admin_user_service import AdminUserService

def get_admin_user_service(
    users_repo: AuthUsersRepository = Depends(get_users_repo)
) -> AdminUserService:
    return AdminUserService(users_repo)
