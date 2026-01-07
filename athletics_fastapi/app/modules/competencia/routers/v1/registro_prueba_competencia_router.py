from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.modules.competencia.domain.schemas.registro_prueba_competencia_schema import (
    RegistroPruebaCompetenciaCreate,
    RegistroPruebaCompetenciaUpdate,
    RegistroPruebaCompetenciaResponse,
    RegistroPruebaCompetenciaList
)

from app.modules.competencia.services.registro_prueba_competencia_service import (
    RegistroPruebaCompetenciaService
)

from app.modules.competencia.dependencies import (
    get_registro_prueba_competencia_service
)

router = APIRouter()

# ----------------------------------
# CREATE
# ----------------------------------
@router.post(
    "/",
    response_model=RegistroPruebaCompetenciaResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_registro(
    data: RegistroPruebaCompetenciaCreate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    return await service.create(data)


# ----------------------------------
# GET ALL
# ----------------------------------
@router.get(
    "/",
    response_model=RegistroPruebaCompetenciaList
)
async def get_all_registros(
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    items, total = await service.get_all()
    return {
        "items": items,
        "total": total
    }


# ----------------------------------
# GET ONE (external_id)
# ----------------------------------
@router.get(
    "/{external_id}",
    response_model=RegistroPruebaCompetenciaResponse
)
async def get_registro(
    external_id: UUID,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    registro = await service.get_one(external_id)

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )

    return registro


# ----------------------------------
# UPDATE (external_id)
# ----------------------------------
@router.put(
    "/{external_id}",
    response_model=RegistroPruebaCompetenciaResponse
)
async def update_registro(
    external_id: UUID,
    data: RegistroPruebaCompetenciaUpdate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    registro = await service.update(external_id, data)

    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )

    return registro
