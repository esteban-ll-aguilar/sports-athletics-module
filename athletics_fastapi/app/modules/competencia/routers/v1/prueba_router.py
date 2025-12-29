from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID

from ...domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate, PruebaRead
from ...services.prueba_service import PruebaService
from ...dependencies import get_prueba_service, get_current_admin_or_entrenador

router = APIRouter(
    prefix="/pruebas",
    tags=["Pruebas"]
)

@router.post(
    "/",
    response_model=PruebaRead,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def create_prueba(
    data: PruebaCreate,
    service: PruebaService = Depends(get_prueba_service)
):
    return await service.create_prueba(data)

@router.get("/", response_model=List[PruebaRead])
async def list_pruebas(
    skip: int = 0,
    limit: int = 100,
    service: PruebaService = Depends(get_prueba_service)
):
    return await service.get_pruebas(skip, limit)

@router.get("/{external_id}", response_model=PruebaRead)
async def get_prueba(
    external_id: UUID,
    service: PruebaService = Depends(get_prueba_service)
):
    prueba = await service.get_prueba(external_id)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")
    return prueba

@router.put(
    "/{external_id}",
    response_model=PruebaRead,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def update_prueba(
    external_id: UUID,
    data: PruebaUpdate,
    service: PruebaService = Depends(get_prueba_service)
):
    prueba = await service.update_prueba(external_id, data)
    if not prueba:
        raise HTTPException(status_code=404, detail="Prueba no encontrada")
    return prueba
