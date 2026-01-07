"""Repositorio para Competencia."""
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.competencia.domain.models.competencia_model import Competencia


class CompetenciaRepository:
    """Repositorio para manejar operaciones CRUD de Competencia."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: dict) -> Competencia:
        competencia = Competencia(**data)
        self.session.add(competencia)
        await self.session.commit()
        await self.session.refresh(competencia)
        return competencia

    async def get_by_id(self, id: int) -> Competencia | None:
        result = await self.session.execute(
            select(Competencia).where(Competencia.id == id)
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: UUID) -> Competencia | None:
        result = await self.session.execute(
            select(Competencia).where(Competencia.external_id == external_id)
        )
        return result.scalars().first()

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: int = None):
        query = select(Competencia)

        if not incluir_inactivos:
            query = query.where(Competencia.estado == True)

        if entrenador_id:
            query = query.where(Competencia.entrenador_id == entrenador_id)

        result = await self.session.execute(query)
        return result.scalars().all()

    async def update(self, competencia: Competencia, changes: dict) -> Competencia:
        for field, value in changes.items():
            setattr(competencia, field, value)

        await self.session.commit()
        await self.session.refresh(competencia)
        return competencia

    async def delete(self, id: int) -> bool:
        competencia = await self.get_by_id(id)
        if not competencia:
            return False

        await self.session.delete(competencia)
        await self.session.commit()
        return True

    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count(Competencia.id))
        )
        return result.scalar() or 0
