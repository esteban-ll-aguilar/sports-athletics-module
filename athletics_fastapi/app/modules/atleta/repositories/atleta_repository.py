from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import selectinload

from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum

class AtletaRepository:
    """Repositorio para manejar la entidad 'Atleta'"""

    def __init__(self, session: AsyncSession):
        self.session = session

    # ----------------------
    # Crear un atleta
    # ----------------------
    async def create(self, atleta: Atleta) -> Atleta:
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        
        # Load user and nest load auth for email property
        stmt = (
            select(Atleta)
            .where(Atleta.id == atleta.id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    # ----------------------
    # Obtener por ID (primary key de tabla atleta)
    # ----------------------
    async def get_by_id(self, atleta_id: int) -> Optional[Atleta]:
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.id == atleta_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener por user_id (FK a auth_users)
    # ----------------------
    async def get_by_user_id(self, user_id: int) -> Optional[Atleta]:
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.user_id == user_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener por external_id (UUID)
    # ----------------------
    async def get_by_external_id(self, external_id: UUID) -> Optional[Atleta]:
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.external_id == external_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener todos los atletas (con paginación)
    # ----------------------
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Atleta]:
        result = await self.session.execute(
            select(Atleta)
            .join(Atleta.user)
            .where(UserModel.role == RoleEnum.ATLETA)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    # ----------------------
    # Actualizar atleta
    # ----------------------
    async def update(self, atleta: Atleta) -> Atleta:
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        # Reload relationships
        stmt = (
            select(Atleta)
            .where(Atleta.id == atleta.id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    # ----------------------
    # Eliminar atleta
    # ----------------------
    async def delete(self, atleta: Atleta) -> None:
        await self.session.delete(atleta)
        await self.session.commit()

    # ----------------------
    # Contar atletas
    # ----------------------
    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count(Atleta.id))
            .join(Atleta.user)
            .where(UserModel.role == RoleEnum.ATLETA)
        )
        return result.scalar() or 0

    async def get_by_representante_id(self, representante_id: int) -> List[Atleta]:
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.representante_id == representante_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().all()



