from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import List

from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoRead, BaremoUpdate
)
from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.dependencies import get_baremo_service, get_current_admin_or_entrenador

router = APIRouter(
    prefix="/baremos",
    tags=["Baremos"]
)

# ----------------------
# Create Baremo (protegido)
# ----------------------
@router.post(
    "/",
    response_model=BaremoRead
)
async def create_baremo(
    data: BaremoCreate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    return await service.create(data)


# ----------------------
# List Baremos (público)
# ----------------------
@router.get("/", response_model=List[BaremoRead])
async def list_baremos(
    incluir_inactivos: bool = True,
    service: BaremoService = Depends(get_baremo_service)
):
    return await service.get_all(incluir_inactivos)


# ----------------------
# Get Baremo by ID (público)
# ----------------------
@router.get("/{external_id}", response_model=BaremoRead)
async def get_baremo(
    external_id: UUID,
    service: BaremoService = Depends(get_baremo_service)
):
    baremo = await service.get(external_id)
    if not baremo:
        raise HTTPException(status_code=404, detail="Baremo no encontrado")
    return baremo


# ----------------------
# Update Baremo (protegido)
# ----------------------
@router.put(
    "/{external_id}",
    response_model=BaremoRead
)
async def update_baremo(
    external_id: UUID,
    data: BaremoUpdate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    return await service.update(external_id, data)

