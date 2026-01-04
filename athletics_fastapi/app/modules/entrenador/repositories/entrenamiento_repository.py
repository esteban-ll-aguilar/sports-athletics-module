from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento

class EntrenamientoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, entrenamiento: Entrenamiento) -> Entrenamiento:
        self.session.add(entrenamiento)
        await self.session.commit()
        await self.session.refresh(entrenamiento)
        return entrenamiento

    async def get_all_by_entrenador(self, entrenador_id: int) -> List[Entrenamiento]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.entrenador_id == entrenador_id)
            .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().all()

    async def get_by_id(self, entrenamiento_id: int) -> Optional[Entrenamiento]:
        result = await self.session.execute(
            select(Entrenamiento).where(Entrenamiento.id == entrenamiento_id)
        )
        return result.scalars().first()
    
    async def get_by_id_and_entrenador(self, entrenamiento_id: int, entrenador_id: int) -> Optional[Entrenamiento]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(
                Entrenamiento.id == entrenamiento_id,
                Entrenamiento.entrenador_id == entrenador_id
            )
            .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def update(self, entrenamiento: Entrenamiento) -> Entrenamiento:
        self.session.add(entrenamiento)
        await self.session.commit()
        await self.session.refresh(entrenamiento)
        return entrenamiento

    async def delete(self, entrenamiento: Entrenamiento) -> None:
        await self.session.delete(entrenamiento)
        await self.session.commit()
