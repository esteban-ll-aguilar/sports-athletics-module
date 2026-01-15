from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime
import uuid

from app.modules.auth.domain.models.auth_user_model import AuthUserModel

from app.modules.auth.domain.schemas.schemas_users import (
    UserCreateSchema,
    UserUpdateSchema,
)

from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.atleta.domain.schemas.atleta_schema import AtletaCreate
from app.modules.entrenador.domain.schemas.entrenador_schema import EntrenadorCreate

from app.modules.external.domain.schemas.users_api_schemas import (
    UserExternalCreateRequest,
    UserExternalUpdateAccountRequest,
    UserExternalUpdateRequest,
)

from app.modules.external.dependencies import get_external_users_service
from app.core.logging.logger import logger


class AuthUsersRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    # =====================================================
    # CREATE USER
    # =====================================================
    # =====================================================
    # CREATE USER
    # =====================================================
    async def create(
        self,
        password_hash: str,
        user_data: UserCreateSchema,
    ) -> UserModel:

        # Instantiate external service manually since we are in a repo, not a route
        # Using local import to avoid circular dependency if any, or just import at top
        from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
        from app.modules.external.services.external_users_api_service import ExternalUsersApiService
        
        external_repo = ExternalUsersApiRepository(self.db)
        external_service = ExternalUsersApiService(external_repo)

        try:
            # Crear usuario en sistema externo
            # Nota: Ajustamos para usar los datos del schema que ahora sí tiene los campos
            external_user = await external_service.create_user(
                UserExternalCreateRequest(
                    first_name=user_data.first_name,
                    last_name=user_data.last_name,
                    type_identification=user_data.tipo_identificacion.value,
                    identification=user_data.identificacion,
                    type_stament=user_data.tipo_estamento.value,
                    direction=user_data.direccion,
                    phono=user_data.phone,
                    email=user_data.email,
                    password=user_data.password
                )
            )
        except Exception as e:
            logger.error(f"Error creating user in external service: {e}", exc_info=True)
            # Re-raise or handle gracefully. If external service creation fails, we likely shouldn't proceed.
            raise e

        # 1. Crear AuthUser
        auth_user = AuthUserModel(
            email=user_data.email,
            hashed_password=password_hash,
            is_active=False, # Wait for email verification
            created_at=datetime.utcnow(),
        )
        self.db.add(auth_user)
        # Flush para obtener auth_user.id
        await self.db.flush()

        # 2. Crear UserModel (Profile)
        user_profile = UserModel(
            auth_user_id=auth_user.id,
            external_id=external_user.data.get("external"), # Usamos el ID del servicio externo
            username=user_data.username,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            profile_image=user_data.profile_image,
            direccion=user_data.direccion,
            tipo_identificacion=user_data.tipo_identificacion,
            identificacion=user_data.identificacion,
            tipo_estamento=user_data.tipo_estamento,
            fecha_nacimiento=user_data.fecha_nacimiento,
            sexo=user_data.sexo,
            role=user_data.role
        )
        self.db.add(user_profile)
        # Flush para obtener user_profile.id
        await self.db.flush()

        # 3. Crear Entidad Específica según Rol
        if user_data.role == RoleEnum.ATLETA and user_data.atleta_data:
            atleta = Atleta(
                user_id=user_profile.id,
                anios_experiencia=user_data.atleta_data.anios_experiencia,
                # Mapa otros campos si existen en create schema
            )
            self.db.add(atleta)
        
        elif user_data.role == RoleEnum.ENTRENADOR and user_data.entrenador_data:
            entrenador = Entrenador(
                user_id=user_profile.id,
                anios_experiencia=user_data.entrenador_data.anios_experiencia,
                is_pasante=user_data.entrenador_data.is_pasante
            )
            self.db.add(entrenador)
        
        elif user_data.role == RoleEnum.REPRESENTANTE:
            representante = Representante(
                user_id=user_profile.id
            )
            self.db.add(representante)

        # Commit final lo hace el llamador o aquí si queremos asegurar atomicidad completa del repo method
        # El código original hacía commit, así que lo mantenemos.
        await self.db.commit()
        await self.db.refresh(user_profile)
        
        # Cargar relaciones si es necesario para el response
        # await self.db.refresh(user_profile, attribute_names=["auth", "atleta", "entrenador"])

        return user_profile

    # =====================================================
    # GET BY ID
    # =====================================================
    async def get_by_id(self, user_id: uuid.UUID) -> Optional[AuthUserModel]:
        result = await self.db.execute(
            select(AuthUserModel).where(AuthUserModel.id == user_id)
        )
        return result.scalar_one_or_none()

    # =====================================================
    # GET BY EXTERNAL ID
    # =====================================================
    async def get_by_external_id(self, external_id: str) -> Optional[UserModel]:
        # external_id está en UserModel
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.external_id == external_id)
            .join(UserModel.auth) # Eager load auth for properties like email/is_active
        )
        return result.scalar_one_or_none()

    # =====================================================
    # UPDATE USER
    # =====================================================
    async def update(
        self,
        user: UserModel,
        user_data: UserUpdateSchema,
    ) -> UserModel:

        from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
        from app.modules.external.services.external_users_api_service import ExternalUsersApiService
        
        external_repo = ExternalUsersApiRepository(self.db)
        external_service = ExternalUsersApiService(external_repo)

        # Actualizar datos externos (Opcional, no bloquear si falla el servicio externo)
        try:
            from app.modules.external.domain.schemas.users_api_schemas import UserExternalUpdateRequest
            await external_service.update_user(
                UserExternalUpdateRequest(
                    dni=user.identificacion,
                    first_name=user_data.first_name or user.first_name,
                    last_name=user_data.last_name or user.last_name,
                    type_identification=user.tipo_identificacion.value,
                    type_stament=user.tipo_estamento.value,
                    direction=user_data.direccion or user.direccion or "N/A",
                    phono=user_data.phone or user.phone or "N/A"
                )
            )
        except Exception as e:
            logger.warning(f"⚠️ Error actualizando usuario en servicio externo: {e}")

        data_dict = user_data.model_dump(exclude_unset=True)
        
        # Manejar campos de AuthUserModel (proxied)
        if "email" in data_dict:
            user.auth.email = data_dict.pop("email")
        if "is_active" in data_dict:
            user.auth.is_active = data_dict.pop("is_active")
            
        # Actualizar UserModel con los campos restantes
        for field, value in data_dict.items():
            if hasattr(user, field):
                setattr(user, field, value)

        # Si user_data tuviera email, habría que actualizar user.auth.email, pero
        # UserUpdateSchema parece ser solo de perfil (username, names, phone...).
        # Email se maneja por separado usualmente o en Admin update.

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    # =====================================================
    # UPDATE PASSWORD
    # =====================================================
    async def update_password(
        self,
        user: AuthUserModel,
        new_password_hash: str,
    ) -> None:

        from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
        from app.modules.external.services.external_users_api_service import ExternalUsersApiService
        
        external_repo = ExternalUsersApiRepository(self.db)
        external_service = ExternalUsersApiService(external_repo)

        await external_service.update_user_account(
            user.external_id,
            UserExternalUpdateAccountRequest(
                password=new_password_hash
            )
        )

        user.password = new_password_hash
        self.db.add(user)
        await self.db.commit()

    # =====================================================
    # GET BY EMAIL
    # =====================================================
    async def get_by_email(self, email: str) -> Optional[AuthUserModel]:
        from sqlalchemy.orm import selectinload
        result = await self.db.execute(
            select(AuthUserModel)
            .where(AuthUserModel.email == email)
            .options(selectinload(AuthUserModel.profile))
        )
        return result.scalar_one_or_none()

    # =====================================================
    # PAGINATED LIST
    # =====================================================
    async def get_paginated(
        self,
        page: int = 1,
        size: int = 10,
        role: Optional[RoleEnum] = None,
    ) -> Tuple[List[UserModel], int]:

        offset = (page - 1) * size

        # Query base para contar
        count_query = select(func.count(UserModel.id))
        
        # Query base para datos
        data_query = select(UserModel).options(
            selectinload(UserModel.auth),
            selectinload(UserModel.atleta),
            selectinload(UserModel.entrenador),
            selectinload(UserModel.representante)
        )

        if role:
            count_query = count_query.where(UserModel.role == role)
            data_query = data_query.where(UserModel.role == role)

        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        result = await self.db.execute(
            data_query.offset(offset).limit(size)
        )

        users = result.scalars().all()
        return users, total
