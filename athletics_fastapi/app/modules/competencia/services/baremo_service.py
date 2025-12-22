from uuid import UUID
from fastapi import HTTPException, status
from app.modules.competencia.domain.models.baremo_model import Baremo
from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoUpdate
)
from app.modules.competencia.repositories.baremo_repository import BaremoRepository


class BaremoService:

    def __init__(self, repo: BaremoRepository):
        self.repo = repo

    async def create(self, data: BaremoCreate) -> Baremo:
        baremo = Baremo(**data.model_dump())
        return await self.repo.create(baremo)

    async def get_all(self):
        return await self.repo.get_all()

    async def update(self, external_id: UUID, data: BaremoUpdate) -> Baremo:
        baremo = await self.repo.get_by_external_id(external_id)

        if not baremo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baremo no encontrado"
            )

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(baremo, field, value)

        return await self.repo.update(baremo)
