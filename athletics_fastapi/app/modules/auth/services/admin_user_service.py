from typing import Optional
from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest

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

    async def get_all_users(self, page: int = 1, size: int = 20, role: Optional[RoleEnum] = None):
        # skip calculation is handled inside get_paginated by page/size
        users, total = await self.users_repo.get_paginated(page=page, size=size, role=role)
        
        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
    

    # Función para que el admin pueda actualizar datos de un usuario excepto el rol
    async def update_user_by_id(
        self,
        user_id: str,
        data: AdminUserUpdateRequest
    ):
        user = await self.users_repo.get_by_external_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        if data.username is not None:
            user.username = data.username

        if data.email is not None:
            user.auth.email = data.email

        if data.is_active is not None:
            user.auth.is_active = data.is_active

        if data.profile_image is not None:
            user.profile_image = data.profile_image

        await self.users_repo.session.commit()
        await self.users_repo.session.refresh(user)

        return user
    
    
