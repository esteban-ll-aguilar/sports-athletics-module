from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..domain.models import TipoDisciplina
from ..domain.schemas.tipo_disciplina_schema import TipoDisciplinaCreate, TipoDisciplinaUpdate
from uuid import UUID

class TipoDisciplinaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, tipo_data: TipoDisciplinaCreate):
        tipo = TipoDisciplina(**tipo_data.model_dump())
        self.db.add(tipo)
        await self.db.commit()
        await self.db.refresh(tipo)
        return tipo

    async def get(self, external_id: UUID):
        result = await self.db.execute(
            select(TipoDisciplina).where(TipoDisciplina.external_id == external_id)
        )
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100):
        result = await self.db.execute(select(TipoDisciplina).offset(skip).limit(limit))
        return result.scalars().all()

    async def update(self, external_id: UUID, tipo_data: TipoDisciplinaUpdate):
        tipo = await self.get(external_id)
        if not tipo:
            return None
        for field, value in tipo_data.model_dump(exclude_unset=True).items():
            setattr(tipo, field, value)
        await self.db.commit()
        await self.db.refresh(tipo)
        return tipo

    async def delete(self, external_id: UUID):
        tipo = await self.get(external_id)
        if not tipo:
            return None
        await self.db.delete(tipo)
        await self.db.commit()
        return tipo
