from fastapi import HTTPException
from app.modules.competencia.repositories.tipo_disciplina_repository import TipoDisciplinaRepository
from ..domain.schemas.tipo_disciplina_schema import TipoDisciplinaCreate, TipoDisciplinaUpdate
from uuid import UUID

class TipoDisciplinaService:
    def __init__(self, repo: TipoDisciplinaRepository):
        self.repo = repo

    async def create_tipo(self, tipo_data: TipoDisciplinaCreate):
        return await self.repo.create(tipo_data)

    async def get_tipo(self, external_id: UUID):
        tipo = await self.repo.get(external_id)
        if not tipo:
            raise HTTPException(status_code=404, detail="Tipo de disciplina no encontrado")
        return tipo

    async def get_tipos(self, skip: int = 0, limit: int = 100):
        return await self.repo.list(skip, limit)

    async def update_tipo(self, external_id: UUID, tipo_data: TipoDisciplinaUpdate):
        tipo = await self.repo.get(external_id)
        if not tipo:
            raise HTTPException(status_code=404, detail="Tipo de disciplina no encontrado")
        return await self.repo.update(external_id, tipo_data)

    async def delete_tipo(self, external_id: UUID):
        tipo = await self.repo.get(external_id)
        if not tipo:
            raise HTTPException(status_code=404, detail="Tipo de disciplina no encontrado")
        return await self.repo.delete(external_id)

