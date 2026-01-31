from fastapi import HTTPException, status
from typing import List
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoCreate, EntrenamientoUpdate

class EntrenamientoService:
    def __init__(self, repository: EntrenamientoRepository):
        self.repository = repository

    async def create_entrenamiento(self, schema: EntrenamientoCreate, entrenador_id: int) -> Entrenamiento:
        """
        Crea un nuevo plan de entrenamiento con sus horarios asociados.
        
        Args:
            schema (EntrenamientoCreate): Datos del entrenamiento y lista de horarios.
            entrenador_id (int): ID del entrenador que crea el plan.
            
        Returns:
            Entrenamiento: El entrenamiento creado con sus horarios.
        """
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
        """
        Obtiene lista de entrenamientos creados por un entrenador específico.
        
        Args:
            entrenador_id (int): ID del entrenador.
            
        Returns:
            List[Entrenamiento]: Lista de entrenamientos.
        """
        return await self.repository.get_all_by_entrenador(entrenador_id)

    async def get_entrenamiento_detalle(self, entrenamiento_id: int, entrenador_id: int) -> Entrenamiento:
        """
        Obtiene los detalles de un entrenamiento específico.
        
        Valida que el entrenamiento exista y pertenezca al entrenador.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            entrenador_id (int): ID del entrenador (para verificación de propiedad).
            
        Returns:
            Entrenamiento: Detalles del entrenamiento.
            
        Raises:
            HTTPException: 404 si no se encuentra o no pertenece al entrenador.
        """
        entrenamiento = await self.repository.get_by_id_and_entrenador(entrenamiento_id, entrenador_id)
        if not entrenamiento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrenamiento no encontrado")
        return entrenamiento

    async def update_entrenamiento(self, entrenamiento_id: int, schema: EntrenamientoUpdate, entrenador_id: int) -> Entrenamiento:
        """
        Actualiza un entrenamiento existente y gestiona sus horarios.
        
        Si se proporcionan horarios, reemplaza la lista existente con la nueva (Full Replacement).
        
        Args:
            entrenamiento_id (int): ID del entrenamiento a actualizar.
            schema (EntrenamientoUpdate): Datos a actualizar.
            entrenador_id (int): ID del entrenador.
            
        Returns:
            Entrenamiento: El entrenamiento actualizado.
        """
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
        """
        Elimina un entrenamiento y sus horarios asociados.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            entrenador_id (int): ID del entrenador.
        """
        entrenamiento = await self.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        await self.repository.delete(entrenamiento)
