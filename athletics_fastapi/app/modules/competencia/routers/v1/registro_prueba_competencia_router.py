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
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()

# ----------------------------------
# CREATE
# ----------------------------------
@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_registro(
    data: RegistroPruebaCompetenciaCreate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    try:
        nuevo_registro = await service.create(data)
        return ResponseHandler.success_response(
            summary="Registro creado con exito",
            message="Registro creado con exito",
            data=RegistroPruebaCompetenciaResponse.model_validate(nuevo_registro).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear registro",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ----------------------------------
# GET ALL
# ----------------------------------
@router.get(
    "/",
    response_model=BaseResponse
)
async def get_all_registros(
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    try:
        items, total = await service.get_all()
        
        # Manually construct list since service returns items and total
        data_response = {
            "items": [RegistroPruebaCompetenciaResponse.model_validate(i).model_dump() for i in items],
            "total": total
        }

        return ResponseHandler.success_response(
            summary="Registros obtenidos",
            message="Registros obtenidos con exito",
            data=data_response
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener registros",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ----------------------------------
# GET ONE (external_id)
# ----------------------------------
@router.get(
    "/{external_id}",
    response_model=BaseResponse
)
async def get_registro(
    external_id: UUID,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    try:
        registro = await service.get_one(external_id)

        if not registro:
             return ResponseHandler.not_found_response(
                entity="Registro",
                message="Registro no encontrado"
            )

        return ResponseHandler.success_response(
            summary="Registro encontrado",
            message="Detalle de registro obtenido",
            data=RegistroPruebaCompetenciaResponse.model_validate(registro).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener registro",
            message=str(e)
        )


# ----------------------------------
# UPDATE (external_id)
# ----------------------------------
@router.put(
    "/{external_id}",
    response_model=BaseResponse
)
async def update_registro(
    external_id: UUID,
    data: RegistroPruebaCompetenciaUpdate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    try:
        registro = await service.update(external_id, data)

        if not registro:
             return ResponseHandler.not_found_response(
                entity="Registro",
                message="Registro no encontrado para actualización"
            )

        return ResponseHandler.success_response(
            summary="Registro actualizado con exito",
            message="Registro actualizado correctamente",
            data=RegistroPruebaCompetenciaResponse.model_validate(registro).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al actualizar registro",
            message=str(e)
        )
