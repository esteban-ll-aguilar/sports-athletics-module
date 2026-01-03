from fastapi import HTTPException, status
from typing import List
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoCreate, EntrenamientoUpdate

class EntrenamientoService:
    def __init__(self, repository: EntrenamientoRepository):
        self.repository = repository

    async def create_entrenamiento(self, schema: EntrenamientoCreate, entrenador_id: int) -> Entrenamiento:
        entrenamiento = Entrenamiento(
            **schema.model_dump(),
            entrenador_id=entrenador_id
        )
        return await self.repository.create(entrenamiento)

    async def get_mis_entrenamientos(self, entrenador_id: int) -> List[Entrenamiento]:
        return await self.repository.get_all_by_entrenador(entrenador_id)

    async def get_entrenamiento_detalle(self, entrenamiento_id: int, entrenador_id: int) -> Entrenamiento:
        entrenamiento = await self.repository.get_by_id_and_entrenador(entrenamiento_id, entrenador_id)
        if not entrenamiento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrenamiento no encontrado")
        return entrenamiento

    async def update_entrenamiento(self, entrenamiento_id: int, schema: EntrenamientoUpdate, entrenador_id: int) -> Entrenamiento:
        entrenamiento = await self.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(entrenamiento, key, value)
            
        return await self.repository.update(entrenamiento)

    async def delete_entrenamiento(self, entrenamiento_id: int, entrenador_id: int) -> None:
        entrenamiento = await self.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        await self.repository.delete(entrenamiento)
