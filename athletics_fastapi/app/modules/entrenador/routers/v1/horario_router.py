from fastapi import APIRouter, Depends, status
from typing import List
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.entrenador.domain.schemas.horario_schema import HorarioResponse, HorarioCreate
from app.modules.entrenador.services.horario_service import HorarioService
from app.modules.entrenador.dependencies import get_current_entrenador, get_horario_service

router = APIRouter(
    prefix="/horarios",
    tags=["Entrenador - Horarios"]
)

@router.post(
    "/entrenamiento/{entrenamiento_id}", 
    response_model=HorarioResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Añadir horario a entrenamiento",
    description="Permite definir una nueva franja horaria (día y hora) para un entrenamiento específico."
)
async def create_horario(
    entrenamiento_id: int,
    horario_data: HorarioCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Agrega un nuevo horario (día, horas) a un entrenamiento existente.
    """
    return await service.create_horario(entrenamiento_id, horario_data, current_entrenador.id)

@router.get(
    "/entrenamiento/{entrenamiento_id}", 
    response_model=List[HorarioResponse],
    summary="Listar horarios por entrenamiento",
    description="Recupera todas las sesiones programadas para un entrenamiento dado."
)
async def list_horarios(
    entrenamiento_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Obtiene todos los horarios definidos para un entrenamiento.
    """
    return await service.get_horarios_by_entrenamiento(entrenamiento_id, current_entrenador.id)

@router.delete(
    "/{id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar horario",
    description="Remueve una franja horaria del calendario del entrenamiento."
)
async def delete_horario(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Elimina físicamente un horario.
    """
    await service.delete_horario(id, current_entrenador.id)
