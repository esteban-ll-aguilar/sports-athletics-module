from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Table, select, update, func
from typing import Optional
import random, string
from typing import List, Tuple
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_auth import UserCreate, UserCreateAdmin, UserUpdateRequest
from app.modules.external.services import ExternalUsersApiService
from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
from app.modules.external.domain.schemas.users_api_schemas import UserExternalCreateRequest, UserExternalUpdateAccountRequest, UserExternalUpdateRequest
from app.modules.external.dependencies import get_external_users_service

class AuthUsersRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> AuthUserModel | None:
        res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.email == email))
        return res.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 20) -> list[AuthUserModel]:
        res = await self.session.execute(select(AuthUserModel).offset(skip).limit(limit))
        return list(res.scalars().all())

    async def count(self) -> int:
        res = await self.session.execute(select(func.count()).select_from(AuthUserModel))
        return res.scalar()

    async def get_by_id(self, user_id: int) -> AuthUserModel | None:
        """Obtiene un usuario por su ID interno (int)."""
        res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.id == user_id))
        return res.scalar_one_or_none()

    async def get_by_external_id(self, external_id: str) -> AuthUserModel | None:
        """Obtiene un usuario por su external_id (UUID)."""
        try:
            import uuid
            if isinstance(external_id, str):
                external_id = uuid.UUID(external_id)
            res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.external_id == external_id))
            return res.scalar_one_or_none()
        except (ValueError, TypeError):
            return None

    async def create(self,password_hash: str, user_data: UserCreate | UserCreateAdmin) -> AuthUserModel:
        """Crea un nuevo usuario. Por defecto inactivo hasta verificar email."""
        service = await get_external_users_service(self.session)

        user_search = await service.search_user_by_dni(user_data.identificacion)
        if user_search.status != 200:
            external_user = await service.create_user(
                user=UserExternalCreateRequest(
                    identification=user_data.identificacion,
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    type_identification=user_data.tipo_identificacion,
                    type_stament=user_data.tipo_estamento,
                    direction=user_data.direccion,
                    phono=user_data.phone,
                    email=user_data.email,
                    password=user_data.password
                )
            )
        
        else:
            external_user = await service.update_user(
                user=UserExternalUpdateRequest(
                    dni=user_data.identificacion,
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    type_identification=user_data.tipo_identificacion,
                    type_stament=user_data.tipo_estamento,
                    direction=user_data.direccion,
                    phono=user_data.phone,
                )
            )

        user = AuthUserModel(
            hashed_password=password_hash,
            **user_data.model_dump(exclude={"password"}))
        
        self.session.add(user)
        await self.session.flush()
        return user

   

    async def activate_user(self, email: str) -> bool:
        """Activa un usuario después de verificar el email."""
        user = await self.get_by_email(email)
        if user:
            user.is_active = True
            await self.session.commit()
            return True
        return False

    async def update_password_by_email(self, email: str, new_password_hash: str, password: str) -> bool:
        """Actualiza la contraseña de un usuario por email. Retorna True si se actualizó."""
        user = await self.get_by_email(email)
        service = await get_external_users_service(self.session)

        if user:
            external_user = await service.update_account(
                user=UserExternalUpdateAccountRequest(
                    dni=user.identificacion,
                    password=password
                )
            )
            user.hashed_password = new_password_hash
            await self.session.commit()
            return True
        return False

    async def _generate_code(length: int = 6) -> str:
        # Letras mayúsculas (y dígitos por robustez)
        alphabet = string.ascii_uppercase
        return "".join(random.choices(alphabet, k=length))
    
    async def _password_column_name(users_table: Table) -> Optional[str]:
        candidates = ("password", "password_hash", "hashed_password")
        for c in candidates:
            if c in users_table.c:
                return c
        return None

    async def get_users_paginated(self, page: int = 1, page_size: int = 10) -> Tuple[int, List[AuthUserModel]]:
        """
        Retorna usuarios paginados y total de usuarios.
        """
        # Calcular offset
        offset = (page - 1) * page_size

        # Query principal
        query = select(AuthUserModel).offset(offset).limit(page_size)
        result = await self.session.execute(query)
        users = result.scalars().all()

        # Contar total de usuarios (más eficiente sería con COUNT, pero funciona)
        total_result = await self.session.execute(select(AuthUserModel))
        total = len(total_result.scalars().all())

        return total, users

    async def update_user(self, user_id: int, user_data: UserUpdateRequest):
        user = await self.get_by_id(user_id)
        if user:
            service = await get_external_users_service(self.session)
            external_user = await service.update_user(
                user=UserExternalUpdateRequest(
                    dni=user.identificacion,
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    type_identification=user_data.tipo_identificacion,
                    type_stament=user_data.tipo_estamento,
                    direction=user_data.direccion,
                    phono=user_data.phone,
                )
            )

            user.username = user_data.username
            user.first_name = user_data.first_name
            user.last_name = user_data.last_name
            user.tipo_identificacion = user_data.tipo_identificacion
            user.tipo_estamento = user_data.tipo_estamento
            user.fecha_nacimiento = user_data.fecha_nacimiento
            user.phone = user_data.phone
            user.direccion = user_data.direccion
            user.sexo = user_data.sexo
            user.profile_image = user_data.profile_image

            await self.session.commit()
            return user
