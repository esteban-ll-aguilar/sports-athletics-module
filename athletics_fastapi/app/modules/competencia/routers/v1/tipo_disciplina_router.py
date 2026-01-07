from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID

from ...domain.schemas.tipo_disciplina_schema import (
    TipoDisciplinaCreate,
    TipoDisciplinaUpdate,
    TipoDisciplinaOut
)
from ...services.tipo_disciplina_service import TipoDisciplinaService
from ...dependencies import get_tipo_disciplina_service, get_current_admin_or_entrenador

router = APIRouter()

@router.post(
    "/",
    response_model=TipoDisciplinaOut,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def create_tipo(
    tipo: TipoDisciplinaCreate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    return await service.create_tipo(tipo)


@router.get("/", response_model=List[TipoDisciplinaOut])
async def list_tipos(
    skip: int = 0,
    limit: int = 100,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    return await service.get_tipos(skip, limit)


@router.get("/{external_id}", response_model=TipoDisciplinaOut)
async def get_tipo(
    external_id: UUID,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    tipo = await service.get_tipo(external_id)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo no encontrado")
    return tipo


@router.put(
    "/{external_id}",
    response_model=TipoDisciplinaOut,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def update_tipo(
    external_id: UUID,
    tipo_data: TipoDisciplinaUpdate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    tipo = await service.update_tipo(external_id, tipo_data)
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo no encontrado")
    return tipo
