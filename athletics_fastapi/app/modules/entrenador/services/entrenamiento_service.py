from fastapi import HTTPException, status
from typing import List
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoCreate, EntrenamientoUpdate

class EntrenamientoService:
    def __init__(self, repository: EntrenamientoRepository):
        self.repository = repository

    async def create_entrenamiento(self, schema: EntrenamientoCreate, entrenador_id: int) -> Entrenamiento:
        entrenamiento_data = schema.model_dump(exclude={'horarios'})
        horarios_data = schema.horarios or []

        from app.modules.entrenador.domain.models.horario_model import Horario
        
        entrenamiento = Entrenamiento(
            **entrenamiento_data,
            entrenador_id=entrenador_id
        )
        
        # Create nested Horario objects
        for h_data in horarios_data:
            horario = Horario(**h_data.model_dump())
            entrenamiento.horarios.append(horario)
            
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
        horarios_data = update_data.pop('horarios', None)

        for key, value in update_data.items():
            setattr(entrenamiento, key, value)
            
        if horarios_data is not None:
             # Clear existing schedules and replace with new ones (Full Update strategy)
            # Efficient strategy: delete all old ones and re-create. 
            # Note: repository.update should handle cascade if configured, but let's manual helper
            # Or better: let SQLAlchemy handle list replacement if cascade='all, delete-orphan' is set on relationship
            from app.modules.entrenador.domain.models.horario_model import Horario
            entrenamiento.horarios = [Horario(**h.model_dump()) if hasattr(h, 'model_dump') else Horario(**h) for h in horarios_data] # Adapting to receive dicts or objects
            
        return await self.repository.update(entrenamiento)

    async def delete_entrenamiento(self, entrenamiento_id: int, entrenador_id: int) -> None:
        entrenamiento = await self.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        await self.repository.delete(entrenamiento)
