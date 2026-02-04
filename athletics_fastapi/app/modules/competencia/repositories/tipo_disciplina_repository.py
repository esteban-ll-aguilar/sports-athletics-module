"""
Repositorio para TipoDisciplina.

Este módulo contiene la clase `TipoDisciplinaRepository`, que se encarga de realizar las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para el modelo `TipoDisciplina`.

Clases:
    - TipoDisciplinaRepository: Clase principal para manejar las operaciones de base de datos relacionadas con el modelo `TipoDisciplina`.

Métodos:
    - create(tipo_data: TipoDisciplinaCreate): Crea un nuevo tipo de disciplina y lo guarda en la base de datos.
    - get(external_id: UUID): Obtiene un tipo de disciplina por su `external_id`.
    - get_by_id(id: int): Obtiene un tipo de disciplina por su ID interno (entero).
    - list(skip: int = 0, limit: int = 100): Obtiene una lista de tipos de disciplina con paginación.
    - update(external_id: UUID, tipo_data: TipoDisciplinaUpdate): Actualiza un tipo de disciplina existente identificado por su `external_id`.
    - delete(external_id: UUID): Elimina un tipo de disciplina identificado por su `external_id`.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..domain.models import TipoDisciplina
from ..domain.schemas.tipo_disciplina_schema import TipoDisciplinaCreate, TipoDisciplinaUpdate
from uuid import UUID

class TipoDisciplinaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, tipo_data: TipoDisciplinaCreate):
        """Crea un nuevo tipo de disciplina y lo guarda en la base de datos."""
        # Crea una nueva instancia de TipoDisciplina y la guarda en la base de datos
        tipo = TipoDisciplina(**tipo_data.model_dump())
        self.db.add(tipo)
        await self.db.commit()
        await self.db.refresh(tipo)
        return tipo

    async def get(self, external_id: UUID):
        """Obtiene un tipo de disciplina por su external_id."""
        # Busca un tipo de disciplina utilizando su external_id
        result = await self.db.execute(
            select(TipoDisciplina).where(TipoDisciplina.external_id == external_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, id: int):
        """Obtiene un tipo de disciplina por su ID interno (entero)."""
        # Busca un tipo de disciplina utilizando su ID interno
        result = await self.db.execute(
            select(TipoDisciplina).where(TipoDisciplina.id == id)
        )
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100):
        """Obtiene una lista de tipos de disciplina con paginación."""
        # Recupera una lista de tipos de disciplina con un límite y un desplazamiento
        result = await self.db.execute(select(TipoDisciplina).offset(skip).limit(limit))
        return result.scalars().all()

    async def update(self, external_id: UUID, tipo_data: TipoDisciplinaUpdate):
        """Actualiza un tipo de disciplina existente identificado por su external_id."""
        # Busca el tipo de disciplina y actualiza los campos proporcionados
        tipo = await self.get(external_id)
        if not tipo:
            return None
        for field, value in tipo_data.model_dump(exclude_unset=True).items():
            setattr(tipo, field, value)
        await self.db.commit()
        await self.db.refresh(tipo)
        return tipo

    async def delete(self, external_id: UUID):
        """Elimina un tipo de disciplina identificado por su external_id."""
        # Busca el tipo de disciplina y lo elimina de la base de datos
        tipo = await self.get(external_id)
        if not tipo:
            return None
        await self.db.delete(tipo)
        await self.db.commit()
        return tipo
