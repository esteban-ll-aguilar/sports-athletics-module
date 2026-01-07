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
        # Explicitly reload with eager loading for requirements of the response schema
        # Since refresh() resets attributes, we need to ensure the relationship is loaded relative to the session
        # Standard refresh might not load relationships unless configured.
        # A safer async approach is executing a select with options
        from sqlalchemy.orm import selectinload
        
        # We can refresh the instance, but to get relationships loaded in async, it's often better to re-query 
        # or rely on expiry if the session is still active (but Pydantic access might be outside async Io context if not careful)
        # However, MissingGreenlet usually means we touched a lazy loader.
        # Let's re-fetch fully to be safe.
        
        result = await self.session.execute(
             select(Entrenamiento)
             .where(Entrenamiento.id == entrenamiento.id)
             .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def get_all_by_entrenador(self, entrenador_id: int) -> List[Entrenamiento]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.entrenador_id == entrenador_id)
            .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().all()

    async def get_by_id(self, entrenamiento_id: int) -> Optional[Entrenamiento]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.id == entrenamiento_id)
            .options(selectinload(Entrenamiento.horarios))
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
        
        # Re-fetch to ensure relationships like 'horarios' are loaded for response
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
             select(Entrenamiento)
             .where(Entrenamiento.id == entrenamiento.id)
             .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def delete(self, entrenamiento: Entrenamiento) -> None:
        await self.session.delete(entrenamiento)
        await self.session.commit()
