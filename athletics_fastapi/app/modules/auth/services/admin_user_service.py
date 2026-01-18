from typing import Optional
from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest

class AdminUserService:
    def __init__(self, users_repo: AuthUsersRepository):
        self.users_repo = users_repo

    async def update_user_role(self, user_id: str, new_role: RoleEnum):
        # user_id can be external_id (UUID string) or internal_id (int string)
        user = await self.users_repo.get_by_any_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        
        from app.modules.atleta.domain.models.atleta_model import Atleta
        from app.modules.entrenador.domain.models.entrenador_model import Entrenador
        from app.modules.representante.domain.models.representante_model import Representante

        user.role = new_role

        # Asegurar que exista la sub-entidad para el nuevo rol
        if new_role == RoleEnum.ATLETA and not user.atleta:
            self.users_repo.db.add(Atleta(user_id=user.id, anios_experiencia=0))
        elif new_role == RoleEnum.ENTRENADOR and not user.entrenador:
            self.users_repo.db.add(Entrenador(user_id=user.id, anios_experiencia=0))
        elif new_role == RoleEnum.REPRESENTANTE and not user.representante:
            self.users_repo.db.add(Representante(user_id=user.id))

        await self.users_repo.db.commit()
        await self.users_repo.db.refresh(user)
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
        user = await self.users_repo.get_by_any_id(user_id)

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

        await self.users_repo.db.commit()
        await self.users_repo.db.refresh(user)

        return user
    
    
