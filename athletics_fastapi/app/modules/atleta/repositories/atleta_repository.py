"""Repositorio para Atleta."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from app.modules.atleta.domain.models.atleta_model import Atleta


class AtletaRepository:
    """Repositorio para manejar operaciones CRUD de Atleta."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, atleta: Atleta) -> Atleta:
        """Crear un nuevo atleta."""
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        return atleta

    async def get_by_id(self, id: int) -> Atleta | None:
        """Obtener atleta por ID."""
        result = await self.session.execute(
            select(Atleta).where(Atleta.id == id)
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: UUID) -> Atleta | None:
        """Obtener atleta por external_id."""
        result = await self.session.execute(
            select(Atleta).where(Atleta.external_id == external_id)
        )
        return result.scalars().first()

    async def get_by_user_id(self, user_id: int) -> Atleta | None:
        """Obtener atleta por user_id."""
        result = await self.session.execute(
            select(Atleta).where(Atleta.user_id == user_id)
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100):
        """Obtener todos los atletas con paginación."""
        result = await self.session.execute(
            select(Atleta).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def search_by_name(self, search_term: str, skip: int = 0, limit: int = 100):
        """Buscar atletas por nombre o apellido."""
        result = await self.session.execute(
            select(Atleta)
            .join(Atleta.user)
            .where(
                (Atleta.user.first_name.ilike(f"%{search_term}%")) |
                (Atleta.user.last_name.ilike(f"%{search_term}%"))
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update(self, atleta: Atleta) -> Atleta:
        """Actualizar un atleta."""
        await self.session.merge(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        return atleta

    async def delete(self, id: int) -> bool:
        """Eliminar un atleta."""
        atleta = await self.get_by_id(id)
        if atleta:
            await self.session.delete(atleta)
            await self.session.commit()
            return True
        return False

    async def count(self) -> int:
        """Contar total de atletas."""
        result = await self.session.execute(select(func.count(Atleta.id)))
        return result.scalar() or 0
