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

@router.post("/entrenamiento/{entrenamiento_id}", response_model=HorarioResponse, status_code=status.HTTP_201_CREATED)
async def create_horario(
    entrenamiento_id: int,
    horario_data: HorarioCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Crea un nuevo horario para un entrenamiento específico.
    """
    return await service.create_horario(entrenamiento_id, horario_data, current_entrenador.id)

@router.get("/entrenamiento/{entrenamiento_id}", response_model=List[HorarioResponse])
async def list_horarios(
    entrenamiento_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Lista todos los horarios de un entrenamiento específico.
    """
    return await service.get_horarios_by_entrenamiento(entrenamiento_id, current_entrenador.id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_horario(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """
    Elimina un horario por su ID.
    """
    await service.delete_horario(id, current_entrenador.id)
