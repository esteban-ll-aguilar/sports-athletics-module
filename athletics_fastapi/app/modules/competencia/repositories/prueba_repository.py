from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..domain.models.prueba_model import Prueba
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate

class PruebaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: PruebaCreate):
        prueba = Prueba(**data.dict())
        self.db.add(prueba)
        await self.db.commit()
        await self.db.refresh(prueba)
        return prueba

    async def get(self, external_id: str):
        result = await self.db.execute(
            select(Prueba).where(Prueba.external_id == external_id)
        )
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100):
        result = await self.db.execute(
            select(Prueba).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update(self, external_id: str, data: PruebaUpdate):
        prueba = await self.get(external_id)
        if not prueba:
            return None
        for field, value in data.dict(exclude_unset=True).items():
            setattr(prueba, field, value)
        await self.db.commit()
        await self.db.refresh(prueba)
        return prueba
