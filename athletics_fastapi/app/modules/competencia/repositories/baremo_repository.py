from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.modules.competencia.domain.models.baremo_model import Baremo

# Modelo de repositorio para la entidad Baremo
class BaremoRepository:
    """
    Repositorio encargado de la persistencia y recuperación de la entidad Baremo.

    Implementa el patrón Repository para desacoplar la lógica de acceso a datos
    del resto de la aplicación. Utiliza SQLAlchemy en modo asíncrono y permite
    operaciones CRUD, así como búsquedas contextuales especializadas.
    """

    def __init__(self, session: AsyncSession):
        """
        Inicializa el repositorio con una sesión asíncrona de base de datos.
        """
        self.session = session

    # Crear un nuevo Baremo en la base de datos
    async def create(self, baremo: Baremo | dict) -> Baremo:
        """  Crea y persiste un nuevo Baremo en la base de datos.
        Acepta tanto una instancia del modelo Baremo como un diccionario
        con los datos necesarios. En caso de recibir un diccionario,
        se construye internamente la entidad Baremo.
        """
        if isinstance(baremo, dict):
            baremo = Baremo(**baremo)

        self.session.add(baremo)
        await self.session.commit()
        await self.session.refresh(baremo)
        
        # Re-fetch with eager loading to allow Pydantic serialization
        return await self.get_by_external_id(baremo.external_id)

    # Obtener todos los Baremos activos de la base de datos
    async def get_all(self, incluir_inactivos: bool = True):
        """
        Obtiene todos los Baremo registrados en la base de datos.
        Permite filtrar opcionalmente los registros inactivos y realiza
        carga anticipada de la relación `items` para evitar problemas
        de lazy loading en contextos asíncronos.
        """
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
