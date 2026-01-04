"""Repositorio para Competencia."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from app.modules.competencia.domain.models.competencia_model import Competencia


class CompetenciaRepository:
    """Repositorio para manejar operaciones CRUD de Competencia."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, competencia: Competencia) -> Competencia:
        """Crear una nueva competencia."""
        self.session.add(competencia)
        await self.session.commit()
        await self.session.refresh(competencia)
        return competencia

    async def get_by_id(self, id: int) -> Competencia | None:
        """Obtener competencia por ID."""
        result = await self.session.execute(
            select(Competencia).where(Competencia.id == id)
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: UUID) -> Competencia | None:
        """Obtener competencia por external_id."""
        result = await self.session.execute(
            select(Competencia).where(Competencia.external_id == external_id)
        )
        return result.scalars().first()

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: int = None):
        """Obtener todas las competencias."""
        query = select(Competencia)
        if not incluir_inactivos:
            query = query.where(Competencia.estado == True)
        if entrenador_id:
            query = query.where(Competencia.entrenador_id == entrenador_id)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def update(self, competencia: Competencia) -> Competencia:
        """Actualizar una competencia."""
        await self.session.merge(competencia)
        await self.session.commit()
        return competencia

    async def delete(self, id: int) -> bool:
        """Eliminar una competencia."""
        competencia = await self.get_by_id(id)
        if competencia:
            await self.session.delete(competencia)
            await self.session.commit()
            return True
        return False

    async def count(self) -> int:
        """Contar total de competencias."""
        result = await self.session.execute(select(func.count(Competencia.id)))
        return result.scalar() or 0
