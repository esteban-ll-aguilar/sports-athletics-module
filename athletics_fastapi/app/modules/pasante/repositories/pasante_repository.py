from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List, Optional

from app.modules.pasante.domain.models.pasante_model import Pasante
from app.modules.auth.domain.models.user_model import UserModel

class PasanteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, pasante: Pasante) -> Pasante:
        self.session.add(pasante)
        await self.session.flush()
        return pasante

    async def getattr_by_id(self, pasante_id: int) -> Optional[Pasante]:
        result = await self.session.execute(
            select(Pasante)
            .where(Pasante.id == pasante_id)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
        )
        return result.scalar_one_or_none()

    async def get_by_external_id(self, external_id: UUID) -> Optional[Pasante]:
        result = await self.session.execute(
            select(Pasante)
            .where(Pasante.external_id == external_id)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[Pasante]:
        # Join with User and Auth to ensure we get user data eagerly
        result = await self.session.execute(
            select(Pasante)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
            .order_by(Pasante.id.desc())
        )
        return result.scalars().all()
    
    async def get_by_identificacion(self, identificacion: str) -> Optional[str]:
        # Helper to check if user exists by ID before creating
        result = await self.session.execute(
            select(UserModel).where(UserModel.identificacion == identificacion)
        )
        return result.scalar_one_or_none()

    async def delete(self, pasante: Pasante):
        await self.session.delete(pasante)
