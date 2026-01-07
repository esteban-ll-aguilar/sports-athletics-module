from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..domain.models.prueba_model import Prueba
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate
from sqlalchemy import func

class PruebaRepository:
    """Repositorio para manejar CRUD de Pruebas deportivas"""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ----------------------
    # Crear prueba
    # ----------------------
    async def create(self, data: PruebaCreate) -> Prueba:
        prueba = Prueba(**data.dict())
        self.db.add(prueba)
        await self.db.commit()
        await self.db.refresh(prueba)
        return prueba

    # ----------------------
    # Obtener por external_id
    # ----------------------
    async def get_by_external_id(self, external_id: str) -> Prueba | None:
        result = await self.db.execute(
            select(Prueba).where(Prueba.external_id == external_id)
        )
        return result.scalar_one_or_none()

    # ----------------------
    # Listar todas las pruebas
    # ----------------------
    async def list(self, skip: int = 0, limit: int = 100) -> list[Prueba]:
        result = await self.db.execute(
            select(Prueba).offset(skip).limit(limit)
        )
        return result.scalars().all()

    # ----------------------
    # Actualizar prueba
    # ----------------------
    async def update(self, external_id: str, data: PruebaUpdate) -> Prueba | None:
        prueba = await self.get_by_external_id(external_id)
        if not prueba:
            return None
        for field, value in data.dict(exclude_unset=True).items():
            setattr(prueba, field, value)
        await self.db.commit()
        await self.db.refresh(prueba)
        return prueba

    # ----------------------
    # Eliminar prueba
    # ----------------------
    async def delete(self, external_id: str) -> bool:
        prueba = await self.get_by_external_id(external_id)
        if not prueba:
            return False
        await self.db.delete(prueba)
        await self.db.commit()
        return True

    # ----------------------
    # Contar pruebas
    # ----------------------
    async def count(self) -> int:
        result = await self.db.execute(select(func.count(Prueba.id)))
        return result.scalar() or 0
