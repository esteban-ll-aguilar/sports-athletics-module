from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.modules.competencia.domain.models.registro_prueba_competencia_model import (
    RegistroPruebaCompetencia
)


class RegistroPruebaCompetenciaRepository:

    def __init__(self, session: AsyncSession):
        self.session = session

    # -------------------------
    # CREATE
    # -------------------------
    async def create(self, data: RegistroPruebaCompetencia):
        self.session.add(data)
        await self.session.commit()
        await self.session.refresh(data)
        return data

    # -------------------------
    # GET ALL
    # -------------------------
    async def get_all(self):
        result = await self.session.execute(
            select(RegistroPruebaCompetencia)
        )
        items = result.scalars().all()
        return items, len(items)

    # -------------------------
    # GET ONE (external_id)
    # -------------------------
    async def get_by_external_id(self, external_id: UUID):
        result = await self.session.execute(
            select(RegistroPruebaCompetencia).where(
                RegistroPruebaCompetencia.external_id == external_id
            )
        )
        return result.scalar_one_or_none()

    # -------------------------
    # UPDATE (external_id)
    # -------------------------
    async def update(self, external_id: UUID, data: dict):
        registro = await self.get_by_external_id(external_id)

        if not registro:
            return None

        for key, value in data.items():
            setattr(registro, key, value)

        await self.session.commit()
        await self.session.refresh(registro)
        return registro
