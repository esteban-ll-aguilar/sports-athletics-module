from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Table, select, update, func
from typing import Optional, List, Tuple
import random, string
from datetime import datetime, date
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
    
    async def get_by_username(self, username: str) -> AuthUserModel | None:
        """Obtiene un usuario por su nombre de usuario."""
        res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.username == username))
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

    async def create(self, password_hash: str, user_data: UserCreate | UserCreateAdmin) -> AuthUserModel:
        """Crea un nuevo usuario. Por defecto inactivo hasta verificar email."""
        service = await get_external_users_service(self.session)

        try:
            # Sincronización con sistema externo
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
                        password=user_data.password,
                        fecha_nacimiento=user_data.fecha_nacimiento,
                        sexo=user_data.sexo,
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
        except Exception as e:
            # En entorno local o si falla la API externa, permitimos la creación local
            # Logueamos el error pero no detenemos el flujo
            from app.core.logging.logger import logger
            logger.error(f"Error connecting to external API: {e}") 
            # Podríamos setear un flag o external_id dummy si fuera necesario, 
            # pero el modelo permite que external_id sea nulo o generado (si es UUID default).

        # Convertir fecha_nacimiento a date si viene como string
        fecha_nac: Optional[date] = None
        if user_data.fecha_nacimiento:
            if isinstance(user_data.fecha_nacimiento, str):
                fecha_nac = datetime.strptime(user_data.fecha_nacimiento, "%Y-%m-%d").date()
            elif isinstance(user_data.fecha_nacimiento, date):
                fecha_nac = user_data.fecha_nacimiento

        user = AuthUserModel(
            hashed_password=password_hash,
            **user_data.model_dump(exclude={"password", "fecha_nacimiento", "sexo"}),
            fecha_nacimiento=fecha_nac,
            sexo=user_data.sexo
        )

        self.session.add(user)
        await self.session.flush()
        
        # Auto-create role specific entries
        from app.modules.auth.domain.enums import RoleEnum
        if user.role == RoleEnum.REPRESENTANTE:
             from app.modules.representante.domain.models.representante_model import Representante
             new_representante = Representante(user_id=user.id)
             self.session.add(new_representante)
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
            try:
                external_user = await service.update_account(
                    user=UserExternalUpdateAccountRequest(
                        dni=user.identificacion,
                        password=password
                    )
                )
            except Exception as e:
                # Log error but verify if we should proceed.
                # In development/localhost, we might want to proceed even if external fails.
                print(f"Error updating external account: {e}")
                # For now, we proceed to update local password
                
            user.hashed_password = new_password_hash
            await self.session.commit()
            return True
        return False

    async def _generate_code(length: int = 6) -> str:
        alphabet = string.ascii_uppercase
        return "".join(random.choices(alphabet, k=length))
    
    async def _password_column_name(users_table: Table) -> Optional[str]:
        candidates = ("password", "password_hash", "hashed_password")
        for c in candidates:
            if c in users_table.c:
                return c
        return None

    async def get_users_paginated(self, page: int = 1, page_size: int = 10) -> Tuple[int, List[AuthUserModel]]:
        offset = (page - 1) * page_size
        query = select(AuthUserModel).offset(offset).limit(page_size)
        result = await self.session.execute(query)
        users = result.scalars().all()
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

            # Convertir fecha_nacimiento a date si viene como string
            fecha_nac: Optional[date] = None
            if user_data.fecha_nacimiento:
                if isinstance(user_data.fecha_nacimiento, str):
                    fecha_nac = datetime.strptime(user_data.fecha_nacimiento, "%Y-%m-%d").date()
                elif isinstance(user_data.fecha_nacimiento, date):
                    fecha_nac = user_data.fecha_nacimiento

            user.username = user_data.username
            user.first_name = user_data.first_name
            user.last_name = user_data.last_name
            user.tipo_identificacion = user_data.tipo_identificacion
            user.tipo_estamento = user_data.tipo_estamento
            user.fecha_nacimiento = fecha_nac
            user.phone = user_data.phone
            user.direccion = user_data.direccion
            user.sexo = user_data.sexo
            user.profile_image = user_data.profile_image

            await self.session.commit()
            return user
