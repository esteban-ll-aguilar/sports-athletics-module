from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Table, select, update
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from typing import Optional
import random, string

class AuthUsersRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> AuthUserModel | None:
        res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.email == email))
        return res.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> AuthUserModel | None:
        """Busca usuario por nombre (username)."""
        res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.nombre == username))
        return res.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> AuthUserModel | None:
        """Obtiene un usuario por su ID (UUID o string)."""
        try:
            # Convertir a UUID si es string
            if isinstance(user_id, str):
                import uuid
                user_id = uuid.UUID(user_id)
            
            res = await self.session.execute(select(AuthUserModel).where(AuthUserModel.id == user_id))
            return res.scalar_one_or_none()
        except (ValueError, TypeError):
            return None

    async def create(self, email: str, password_hash: str, is_active: bool = False) -> AuthUserModel:
        """Crea un nuevo usuario. Por defecto inactivo hasta verificar email."""
        user = AuthUserModel(email=email, hashed_password=password_hash, is_active=is_active)
        self.session.add(user)
        await self.session.flush()
        return user
    
    async def create_user(self, user: AuthUserModel) -> AuthUserModel:
        """Crea un nuevo usuario a partir de un modelo completo."""
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def activate_user(self, email: str) -> bool:
        """Activa un usuario después de verificar el email."""
        user = await self.get_by_email(email)
        if user:
            user.is_active = True
            await self.session.commit()
            return True
        return False

    async def update_password_by_email(self, email: str, new_password_hash: str) -> bool:
        """Actualiza la contraseña de un usuario por email. Retorna True si se actualizó."""
        user = await self.get_by_email(email)
        if user:
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