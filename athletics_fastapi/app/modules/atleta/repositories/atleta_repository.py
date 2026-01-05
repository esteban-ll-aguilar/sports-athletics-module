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
