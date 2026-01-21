from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime
import uuid

from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum

from app.modules.auth.domain.schemas.schemas_users import (
    UserCreateSchema,
    UserUpdateSchema,
)

from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.representante.domain.models.representante_model import Representante

from app.modules.external.domain.schemas.users_api_schemas import (
    UserExternalCreateRequest,
    UserExternalUpdateAccountRequest,
    UserExternalUpdateRequest,
)

from app.core.logging.logger import logger


class AuthUsersRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    # =====================================================
    # UPDATE PROFILE
    # =====================================================
    # =====================================================
    # UPDATE PROFILE (Helpers)
    # =====================================================
    async def update_profile(self, user: UserModel):
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def commit(self):
        await self.db.commit()

    async def refresh(self, instance):
        await self.db.refresh(instance)
    # =====================================================
    # CREATE USER
    # =====================================================
    async def create(
        self,
        password_hash: str,
        user_data: UserCreateSchema,
    ) -> UserModel:

        from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
        from app.modules.external.services.external_users_api_service import ExternalUsersApiService

        external_repo = ExternalUsersApiRepository(self.db)
        external_service = ExternalUsersApiService(external_repo)

        try:
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
            raise e

        # 1. Auth user
        auth_user = AuthUserModel(
            email=user_data.email,
            hashed_password=password_hash,
            is_active=False,
            created_at=datetime.utcnow(),
        )
        self.db.add(auth_user)
        await self.db.flush()

        # 2. User profile
        user_profile = UserModel(
            auth_user_id=auth_user.id,
            external_id=external_user.data.get("external"),
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
            role=user_data.role,
        )
        self.db.add(user_profile)
        await self.db.flush()

        # 3. Sub-entidad por rol
        if user_data.role == RoleEnum.ATLETA and user_data.atleta_data:
            self.db.add(
                Atleta(
                    user_id=user_profile.id,
                    anios_experiencia=user_data.atleta_data.anios_experiencia,
                )
            )

        elif user_data.role == RoleEnum.ENTRENADOR and user_data.entrenador_data:
            self.db.add(
                Entrenador(
                    user_id=user_profile.id,
                    anios_experiencia=user_data.entrenador_data.anios_experiencia,
                    is_pasante=user_data.entrenador_data.is_pasante,
                )
            )

        elif user_data.role == RoleEnum.REPRESENTANTE:
            self.db.add(Representante(user_id=user_profile.id))

        await self.db.commit()
        await self.db.refresh(user_profile)

        return user_profile

    # =====================================================
    # GET BY ID PROFILE  ✅ CORREGIDO
    # =====================================================
    async def get_by_id_profile(self, user_id: int) -> Optional[UserModel]:
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.id == user_id)
            .options(
                selectinload(UserModel.auth),
                selectinload(UserModel.atleta),
                selectinload(UserModel.entrenador),
                selectinload(UserModel.representante),
            )
        )
        return result.scalars().first()

    # =====================================================
    # GET BY ID (AUTH)
    # =====================================================
    async def get_by_id(self, user_id: int) -> Optional[AuthUserModel]:
        result = await self.db.execute(
            select(AuthUserModel)
            .where(AuthUserModel.id == user_id)
            .options(selectinload(AuthUserModel.profile))
        )
        return result.scalar_one_or_none()

    # =====================================================
    # GET BY EXTERNAL ID
    # =====================================================
    async def get_by_external_id(self, external_id: str) -> Optional[UserModel]:
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.external_id == external_id)
            .options(
                selectinload(UserModel.auth),
                selectinload(UserModel.atleta),
                selectinload(UserModel.entrenador),
                selectinload(UserModel.representante),
            )
        )
        return result.scalar_one_or_none()

    # =====================================================
    # GET BY ANY ID
    # =====================================================
    async def get_by_any_id(self, user_id: str) -> Optional[UserModel]:
        user = None

        # Try UUID
        try:
            val_uuid = uuid.UUID(str(user_id))
            user = await self.get_by_external_id(str(val_uuid))
        except (ValueError, TypeError):
            pass

        # Try internal ID
        if not user and str(user_id).isdigit():
            user = await self.get_by_id_profile(int(user_id))

        return user

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

        try:
            await external_service.update_user(
                UserExternalUpdateRequest(
                    dni=user.identificacion,
                    first_name=user_data.first_name or user.first_name,
                    last_name=user_data.last_name or user.last_name,
                    type_identification=user.tipo_identificacion.value,
                    type_stament=user.tipo_estamento.value,
                    direction=user_data.direccion or user.direccion or "N/A",
                    phono=user_data.phone or user.phone or "N/A",
                )
            )
        except Exception as e:
            logger.warning(f"⚠️ Error actualizando usuario externo: {e}")

        data_dict = user_data.model_dump(exclude_unset=True)

        if "email" in data_dict:
            user.auth.email = data_dict.pop("email")
        if "is_active" in data_dict:
            user.auth.is_active = data_dict.pop("is_active")

        for field, value in data_dict.items():
            if hasattr(user, field):
                setattr(user, field, value)

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
            UserExternalUpdateAccountRequest(password=new_password_hash),
        )

        user.password = new_password_hash
        self.db.add(user)
        await self.db.commit()

    # =====================================================
    # GET BY EMAIL
    # =====================================================
    async def get_by_email(self, email: str) -> Optional[AuthUserModel]:
        result = await self.db.execute(
            select(AuthUserModel)
            .where(AuthUserModel.email == email)
            .options(selectinload(AuthUserModel.profile))
        )
        return result.scalar_one_or_none()

    # =====================================================
    # GET BY USERNAME
    # =====================================================
    async def get_by_username(self, username: str) -> Optional[UserModel]:
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.username == username)
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

        count_query = select(func.count(UserModel.id))
        data_query = select(UserModel).options(
            selectinload(UserModel.auth),
            selectinload(UserModel.atleta),
            selectinload(UserModel.entrenador),
            selectinload(UserModel.representante),
        )

        if role:
            count_query = count_query.where(UserModel.role == role)
            data_query = data_query.where(UserModel.role == role)

        total = (await self.db.execute(count_query)).scalar_one()
        users = (
            await self.db.execute(data_query.offset(offset).limit(size))
        ).scalars().all()

        return users, total
    async def update_password_by_email(self, email: str, new_password_hash: str, password: str = None) -> bool:
        """
        Actualiza la contraseña de un usuario dado su email.
        Retorna True si tuvo éxito, False si el usuario no existe.
        """
        user = await self.get_by_email(email)
        if not user:
            return False
            
        # Actualizar en servicio externo si se provee la contraseña en plano
        if password:
            try:
                from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
                from app.modules.external.services.external_users_api_service import ExternalUsersApiService
                from app.modules.external.domain.schemas.users_api_schemas import UserExternalUpdateAccountRequest
                
                external_repo = ExternalUsersApiRepository(self.db)
                external_service = ExternalUsersApiService(external_repo)
                
                # Necesitamos el external_id que está en el perfil (UserModel)
                # El get_by_email ya hace eager load del profile
                if user.profile and user.profile.external_id:
                     await external_service.update_user_account(
                        str(user.profile.external_id),
                        UserExternalUpdateAccountRequest(
                            dni=user.profile.identificacion,
                            password=password
                        )
                    )
            except Exception as e:
                logger.warning(f"⚠️ Error actualizando contraseña en servicio externo para {email}: {e}")
                # No fallamos el reset local si falla el externo
        
        user.hashed_password = new_password_hash
        self.db.add(user)
        try:
            await self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error updating password in DB: {e}")
            await self.db.rollback()
            return False

    async def activate_user(self, email: str) -> bool:
        """
        Activa un usuario dado su email.
        Retorna True si tuvo éxito, False si el usuario no existe.
        """
        user = await self.get_by_email(email)
        if not user:
            return False
            
        user.is_active = True
        user.email_confirmed_at = datetime.utcnow()
        self.db.add(user)
        
        try:
            await self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error activating user {email}: {e}")
            await self.db.rollback()
            return False
