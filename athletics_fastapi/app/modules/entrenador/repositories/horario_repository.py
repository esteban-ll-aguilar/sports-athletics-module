from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.horario_model import Horario

class HorarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, horario: Horario) -> Horario:
        self.session.add(horario)
        await self.session.commit()
        await self.session.refresh(horario)
        return horario

    async def get_all_by_entrenamiento(self, entrenamiento_id: int) -> List[Horario]:
        result = await self.session.execute(
            select(Horario).where(Horario.entrenamiento_id == entrenamiento_id)
        )
        return result.scalars().all()

    async def get_by_id(self, horario_id: int) -> Optional[Horario]:
        result = await self.session.execute(
            select(Horario).where(Horario.id == horario_id)
        )
        return result.scalars().first()

    async def delete(self, horario: Horario) -> None:
        await self.session.delete(horario)
        await self.session.commit()
