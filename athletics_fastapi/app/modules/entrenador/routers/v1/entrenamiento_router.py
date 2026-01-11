from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoResponse, EntrenamientoCreate, EntrenamientoUpdate
from app.modules.entrenador.services.entrenamiento_service import EntrenamientoService
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.dependencies import get_current_entrenador
from app.modules.entrenador.domain.models.entrenador_model import Entrenador

router = APIRouter(
    prefix="/entrenamientos",
    tags=["Entrenador - Entrenamientos"]
)

async def get_entrenamiento_service(session: AsyncSession = Depends(get_session)) -> EntrenamientoService:
    repo = EntrenamientoRepository(session)
    return EntrenamientoService(repo)

@router.post("/", response_model=EntrenamientoResponse, status_code=status.HTTP_201_CREATED)
async def create_entrenamiento(
    entrenamiento_data: EntrenamientoCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    return await service.create_entrenamiento(entrenamiento_data, current_entrenador.id)

@router.get("/", response_model=List[EntrenamientoResponse])
async def list_entrenamientos(
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    return await service.get_mis_entrenamientos(current_entrenador.id)

@router.get("/{id}", response_model=EntrenamientoResponse)
async def get_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    return await service.get_entrenamiento_detalle(id, current_entrenador.id)

@router.put("/{id}", response_model=EntrenamientoResponse)
async def update_entrenamiento(
    id: int,
    entrenamiento_update: EntrenamientoUpdate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    return await service.update_entrenamiento(id, entrenamiento_update, current_entrenador.id)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    await service.delete_entrenamiento(id, current_entrenador.id)
