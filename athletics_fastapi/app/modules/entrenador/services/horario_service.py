from fastapi import HTTPException, status
from typing import List
from app.modules.entrenador.repositories.horario_repository import HorarioRepository
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.domain.models.horario_model import Horario
from app.modules.entrenador.domain.schemas.horario_schema import HorarioCreate

class HorarioService:
    def __init__(self, repository: HorarioRepository, entrenamiento_repo: EntrenamientoRepository):
        self.repository = repository
        self.entrenamiento_repo = entrenamiento_repo

    async def create_horario(self, entrenamiento_id: int, schema: HorarioCreate, entrenador_id: int) -> Horario:
        """
        Agrega un nuevo horario a un entrenamiento existente.
        
        Verifica que el entrenamiento pertenezca al entrenador y que las horas sean consistentes.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            schema (HorarioCreate): Datos del horario (día, hora inicio, hora fin, lugar).
            entrenador_id (int): ID del entrenador.
            
        Returns:
            Horario: El horario creado.
            
        Raises:
            HTTPException:
                - 404 si el entrenamiento no existe.
                - 400 si la hora de inicio no es menor a la fin.
        """
        # 1. Verificar que el entrenamiento existe y pertenece al entrenador
        entrenamiento = await self.entrenamiento_repo.get_by_id_and_entrenador(entrenamiento_id, entrenador_id)
        if not entrenamiento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrenamiento no encontrado o no autorizado")

        # 2. Validar horas
        if schema.hora_inicio >= schema.hora_fin:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La hora de inicio debe ser anterior a la hora de fin")

        # 3. Crear horario
        horario = Horario(
            **schema.model_dump(),
            entrenamiento_id=entrenamiento_id
        )
        return await self.repository.create(horario)

    async def get_horarios_by_entrenamiento(self, entrenamiento_id: int, entrenador_id: int) -> List[Horario]:
        """
        Obtiene todos los horarios de un entrenamiento.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            entrenador_id (int): ID del entrenador (para autorización).
            
        Returns:
            List[Horario]: Lista de horarios.
        """
        # Verificar acceso
        entrenamiento = await self.entrenamiento_repo.get_by_id_and_entrenador(entrenamiento_id, entrenador_id)
        if not entrenamiento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrenamiento no encontrado o no autorizado")
        
        return await self.repository.get_all_by_entrenamiento(entrenamiento_id)

    async def delete_horario(self, horario_id: int, entrenador_id: int) -> None:
        """
        Elimina un horario específico.
        
        Verifica que el horario exista y pertenezca a un entrenamiento del entrenador solicitante.
        
        Args:
            horario_id (int): ID del horario a eliminar.
            entrenador_id (int): ID del entrenador.
            
        Raises:
            HTTPException:
                - 404 si el horario no existe.
                - 403 si el horario no pertenece al entrenador.
        """
        horario = await self.repository.get_by_id(horario_id)
        if not horario:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

        # Verificar que el horario pertenece a un entrenamiento del entrenador
        # Cargamos el entrenamiento para verificar el dueño (aunque get_by_id del repo horario no trae eager load por defecto, 
        # asumimos que podemos acceder a entrenamiento_id y checkear)
        
        entrenamiento = await self.entrenamiento_repo.get_by_id_and_entrenador(horario.entrenamiento_id, entrenador_id)
        if not entrenamiento:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para eliminar este horario")

        await self.repository.delete(horario)
