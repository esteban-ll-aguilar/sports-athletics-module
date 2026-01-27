from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.modules.auth.domain.models.auth_users_sessions_model import AuthUsersSessionsModel
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class SessionsRepository:
    """Repositorio para gestionar sesiones de usuario en la base de datos."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_session(
        self,
        user_id: uuid.UUID,
        access_jti: str,
        refresh_jti: str,
        expires_at: datetime
    ) -> AuthUsersSessionsModel:
        """Crea una nueva sesión en la base de datos."""
        session = AuthUsersSessionsModel(
            user_id=user_id,
            access_token=access_jti,  # Guardamos solo el JTI, no el token completo
            refresh_token=refresh_jti,
            status=True,
            expires_at=expires_at
        )
        self.session.add(session)
        await self.session.flush()
        return session

    async def get_session_by_refresh_jti(self, refresh_jti: str) -> Optional[AuthUsersSessionsModel]:
        """Obtiene una sesión por el JTI del refresh token."""
        result = await self.session.execute(
            select(AuthUsersSessionsModel)
            .where(
                AuthUsersSessionsModel.refresh_token == refresh_jti,
                AuthUsersSessionsModel.status == True
            )
        )
        return result.scalar_one_or_none()

    async def get_active_sessions_by_user(self, user_id: uuid.UUID) -> List[AuthUsersSessionsModel]:
        """Obtiene todas las sesiones activas de un usuario."""
        result = await self.session.execute(
            select(AuthUsersSessionsModel)
            .where(
                AuthUsersSessionsModel.user_id == user_id,
                AuthUsersSessionsModel.status == True
            )
            .order_by(AuthUsersSessionsModel.created_at.desc())
        )
        return result.scalars().all()

    async def revoke_session_by_refresh_jti(self, refresh_jti: str) -> bool:
        """Revoca una sesión por su refresh JTI."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(AuthUsersSessionsModel.refresh_token == refresh_jti)
            .values(status=False)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def revoke_session_by_access_jti(self, access_jti: str) -> bool:
        """Revoca una sesión por su access JTI."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(AuthUsersSessionsModel.access_token == access_jti)
            .values(status=False)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def revoke_all_user_sessions(self, user_id: uuid.UUID) -> int:
        """Revoca todas las sesiones de un usuario."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(
                AuthUsersSessionsModel.user_id == user_id,
                AuthUsersSessionsModel.status == True
            )
            .values(status=False)
        )
        await self.session.commit()
        return result.rowcount

    async def update_session_access_token(
        self,
        refresh_jti: str,
        new_access_jti: str
    ) -> bool:
        """Actualiza el access token de una sesión (cuando se hace refresh)."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(AuthUsersSessionsModel.refresh_token == refresh_jti)
            .values(access_token=new_access_jti)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def cleanup_expired_sessions(self) -> int:
        """Elimina sesiones expiradas (para mantenimiento)."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(
                AuthUsersSessionsModel.expires_at < datetime.now(timezone.utc),
                AuthUsersSessionsModel.status == True
            )
            .values(status=False)
        )
        await self.session.commit()
        return result.rowcount
    
    async def get_latest_active_session(self, user_id: uuid.UUID) -> Optional[AuthUsersSessionsModel]:
        """Obtiene la sesión activa más reciente del usuario."""
        result = await self.session.execute(
            select(AuthUsersSessionsModel)
            .where(
                AuthUsersSessionsModel.user_id == user_id,
                AuthUsersSessionsModel.status == True
            )
            .order_by(AuthUsersSessionsModel.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    async def update_session_tokens(
        self,
        session_id: uuid.UUID,
        new_access_jti: str,
        new_refresh_jti: str,
        new_expires_at: datetime
    ) -> bool:
        """Actualiza los tokens de una sesión existente (cuando se hace re-login)."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(AuthUsersSessionsModel.id == session_id)
            .values(
                access_token=new_access_jti,
                refresh_token=new_refresh_jti,
                expires_at=new_expires_at
            )
        )
        return result.rowcount > 0

    async def update_session_after_refresh(
        self,
        old_refresh_jti: str,
        new_access_jti: str,
        new_refresh_jti: str,
        new_expires_at: datetime
    ) -> bool:
        """Actualiza tokens de sesión tras un refresh exitoso, rotando el refresh token."""
        result = await self.session.execute(
            update(AuthUsersSessionsModel)
            .where(AuthUsersSessionsModel.refresh_token == old_refresh_jti)
            .values(
                access_token=new_access_jti,
                refresh_token=new_refresh_jti,
                expires_at=new_expires_at
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    async def create_or_update_session(
        self,
        user_id: uuid.UUID,
        access_jti: str,
        refresh_jti: str,
        expires_at: datetime
    ) -> AuthUsersSessionsModel:
        """
        Crea una nueva sesión o actualiza la última activa si existe.
        """
        # Buscar sesión activa más reciente
        existing_session = await self.get_latest_active_session(user_id)
        
        if existing_session:
            # Actualizar
            existing_session.access_token = access_jti
            existing_session.refresh_token = refresh_jti
            existing_session.expires_at = expires_at
            # El ORM trackea cambios, solo necesitamos flush/commit
            self.session.add(existing_session)
        else:
            # Crear nueva
            existing_session = AuthUsersSessionsModel(
                user_id=user_id,
                access_token=access_jti,
                refresh_token=refresh_jti,
                status=True,
                expires_at=expires_at
            )
            self.session.add(existing_session)
            
        await self.session.commit()
        return existing_session

