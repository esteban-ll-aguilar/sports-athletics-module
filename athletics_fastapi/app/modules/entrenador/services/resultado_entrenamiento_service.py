from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid

from app.modules.entrenador.repositories.resultado_entrenamiento_repository import ResultadoEntrenamientoRepository
from app.modules.entrenador.domain.schemas.resultado_entrenamiento_schema import ResultadoEntrenamientoCreate, ResultadoEntrenamientoUpdate
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository 
from app.modules.atleta.repositories.atleta_repository import AtletaRepository

class ResultadoEntrenamientoService:
    def __init__(self, session: AsyncSession):
        self.repository = ResultadoEntrenamientoRepository(session)
        self.entrenamiento_repo = EntrenamientoRepository(session)
        self.atleta_repo = AtletaRepository(session)

    async def get_all(self, incluir_inactivos: bool = False, entrenador_id: Optional[int] = None):
        return await self.repository.get_all(incluir_inactivos, entrenador_id)

    async def get_by_external_id(self, external_id: uuid.UUID):
        return await self.repository.get_by_external_id(external_id)

    async def create(self, schema: ResultadoEntrenamientoCreate):
        # Resolve IDs
        entrenamiento = await self.entrenamiento_repo.get_by_external_id(schema.entrenamiento_id)
        if not entrenamiento:
             raise HTTPException(status_code=404, detail=f"Entrenamiento {schema.entrenamiento_id} no encontrado")
        
        atleta = await self.atleta_repo.get_by_external_id(schema.atleta_id)
        if not atleta:
             raise HTTPException(status_code=404, detail=f"Atleta {schema.atleta_id} no encontrado")

        return await self.repository.create(schema, entrenamiento.id, atleta.id)

    async def update(self, external_id: uuid.UUID, schema: ResultadoEntrenamientoUpdate):
        db_obj = await self.repository.get_by_external_id(external_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Resultado Entrenamiento no encontrado")
        
        return await self.repository.update(db_obj, schema)

    async def delete(self, external_id: uuid.UUID):
        db_obj = await self.repository.get_by_external_id(external_id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Resultado Entrenamiento no encontrado")
        return await self.repository.delete(db_obj)
