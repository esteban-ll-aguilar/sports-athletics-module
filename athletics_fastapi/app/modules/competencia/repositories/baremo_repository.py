from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.modules.competencia.domain.models.baremo_model import Baremo

# Modelo de repositorio para la entidad Baremo
class BaremoRepository:
    # Inicializador del repositorio con la sesión de la base de datos
    def __init__(self, session: AsyncSession):
        self.session = session

    # Crear un nuevo Baremo en la base de datos
    async def create(self, baremo: Baremo) -> Baremo:
        self.session.add(baremo)
        await self.session.commit()
        await self.session.refresh(baremo)
        return baremo
    # Obtener todos los Baremos activos de la base de datos
    async def get_all(self):
        result = await self.session.execute(
            select(Baremo).where(Baremo.estado == True)
        )
        return result.scalars().all()
    # Obtener un Baremo por su external_id
    async def get_by_external_id(self, external_id: UUID) -> Baremo | None:
        result = await self.session.execute(
            select(Baremo).where(Baremo.external_id == external_id)
        )
        return result.scalar_one_or_none()
    # Actualizar un Baremo existente en la base de datos
    async def update(self, baremo: Baremo) -> Baremo:
        await self.session.commit()
        await self.session.refresh(baremo)
        return baremo
