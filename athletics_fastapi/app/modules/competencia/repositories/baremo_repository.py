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
    async def create(self, baremo: Baremo | dict) -> Baremo:
        if isinstance(baremo, dict):
            # Exclude 'items' from the main dict if it's there, as we might need to handle them separately
            # or rely on SQLAlchemy's ability if configured. 
            # Assuming for now 'items' are handled by the Service or not passed here directly as dicts for simple kwargs
            # STRICT FIX: To avoid complications, let's assume we just save the baremo context first.
            # If the user sends items in the payload, the Service should handle creating them.
            # BUT, the crash is READ.
            # So regardless of how it's saved, we must RETURN a loaded object.
            baremo = Baremo(**baremo)

        self.session.add(baremo)
        await self.session.commit()
        await self.session.refresh(baremo)
        
        # Re-fetch with eager loading to allow Pydantic serialization
        return await self.get_by_external_id(baremo.external_id)

    # Obtener todos los Baremos activos de la base de datos
    async def get_all(self, incluir_inactivos: bool = True):
        from sqlalchemy.orm import selectinload
        query = select(Baremo).options(selectinload(Baremo.items))

        if not incluir_inactivos:
            query = query.where(Baremo.estado == True)

        result = await self.session.execute(query)
        return result.scalars().all()

    # Obtener un Baremo por su external_id
    async def get_by_external_id(self, external_id: UUID) -> Baremo | None:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Baremo).options(selectinload(Baremo.items)).where(Baremo.external_id == external_id)
        )
        return result.scalar_one_or_none()
    # Actualizar un Baremo existente en la base de datos
    async def update(self, baremo: Baremo) -> Baremo:
        await self.session.commit()
        await self.session.refresh(baremo)
        # Re-fetch for safety
        return await self.get_by_external_id(baremo.external_id)

    # Buscar Baremo por contexto (Prueba, Sexo, Edad)
    async def find_by_context(self, prueba_id: int, sexo: str, edad: int) -> Baremo | None:
        from sqlalchemy.orm import selectinload
        
        # Filtro Demográfico: prueba_id, sexo, y rango de edad
        query = (
            select(Baremo)
            .where(Baremo.prueba_id == prueba_id)
            .where(Baremo.sexo == sexo)
            .where(Baremo.edad_min <= edad)
            .where(Baremo.edad_max >= edad)
            .where(Baremo.estado == True)
            .options(selectinload(Baremo.items)) # Cargar items para comparacion
        )
        
        result = await self.session.execute(query)
        return result.scalars().first()
