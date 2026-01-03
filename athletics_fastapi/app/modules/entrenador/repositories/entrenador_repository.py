from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.modules.entrenador.domain.models.entrenador_model import Entrenador

class EntrenadorRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> Optional[Entrenador]:
        result = await self.session.execute(select(Entrenador).where(Entrenador.user_id == user_id))
        return result.scalars().first()

    async def create(self, entrenador: Entrenador) -> Entrenador:
        self.session.add(entrenador)
        await self.session.commit()
        await self.session.refresh(entrenador)
        return entrenador
