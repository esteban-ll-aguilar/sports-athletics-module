from fastapi import APIRouter, Depends
from uuid import UUID
from typing import List

from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoRead, BaremoUpdate
)
from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.dependencies import get_baremo_service
from app.modules.competencia.dependencies import get_current_admin_or_entrenador

router = APIRouter(
    prefix="/baremos",
    tags=["Baremos"]
)

# Create Baremo
@router.post(
    "/",
    response_model=BaremoRead,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def create_baremo(
    data: BaremoCreate,
    service: BaremoService = Depends(get_baremo_service)
):
    return await service.create(data)

# List Baremos
@router.get(
    "/",
    response_model=List[BaremoRead]
)
async def list_baremos(
    service: BaremoService = Depends(get_baremo_service)
):
    return await service.get_all()

# Update Baremo
@router.put(
    "/{external_id}",
    response_model=BaremoRead,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def update_baremo(
    external_id: UUID,
    data: BaremoUpdate,
    service: BaremoService = Depends(get_baremo_service)
):
    return await service.update(external_id, data)
