from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum

class AdminUserService:
    def __init__(self, users_repo: AuthUsersRepository):
        self.users_repo = users_repo

    async def update_user_role(self, user_id: str, new_role: RoleEnum):
        # user_id is now external_id (UUID string)
        user = await self.users_repo.get_by_external_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        
        user.role = new_role
        await self.users_repo.session.commit()
        return user

    async def get_all_users(self, page: int = 1, size: int = 20):
        skip = (page - 1) * size
        users = await self.users_repo.get_all(skip=skip, limit=size)
        total = await self.users_repo.count()
        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
