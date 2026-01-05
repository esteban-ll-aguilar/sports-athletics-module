from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.modules.atleta.domain.models.atleta_model import Atleta

class AtletaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Atleta]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Atleta)
            .options(selectinload(Atleta.user)) # Load auth user details (name, etc.)
            .offset(skip).limit(limit)
        )
        return result.scalars().all()
    async def create(self, atleta: Atleta) -> Atleta:
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        return atleta

    async def get_by_user_id(self, user_id: int) -> Atleta | None:
        result = await self.session.execute(select(Atleta).where(Atleta.user_id == user_id))
        return result.scalars().one_or_none()

    async def get_by_representante_id(self, representante_id: int) -> List[Atleta]:
        # Eager load user to get name, etc.
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.representante_id == representante_id)
            .options(selectinload(Atleta.user))
        )
        return result.scalars().all()
