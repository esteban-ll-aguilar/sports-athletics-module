from fastapi import APIRouter, Depends, status
from uuid import UUID

from ...domain.schemas.tipo_disciplina_schema import (
    TipoDisciplinaCreate,
    TipoDisciplinaUpdate,
    TipoDisciplinaOut
)
from ...services.tipo_disciplina_service import TipoDisciplinaService
from ...dependencies import get_tipo_disciplina_service, get_current_admin_or_entrenador
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()

@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def create_tipo(
    tipo: TipoDisciplinaCreate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    try:
        nuevo_tipo = await service.create_tipo(tipo)
        return ResponseHandler.success_response(
            summary="Tipo de disciplina creado con exito",
            message="Tipo de disciplina creado con exito",
            data=TipoDisciplinaOut.model_validate(nuevo_tipo).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear tipo de disciplina",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/", response_model=BaseResponse)
async def list_tipos(
    skip: int = 0,
    limit: int = 100,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    try:
        tipos = await service.get_tipos(skip, limit)
        if not tipos:
             return ResponseHandler.success_response(
                summary="No hay tipos de disciplinas registrados",
                message="No se encontraron tipos de disciplinas",
                data={"items": []}
            )
        
        items = [TipoDisciplinaOut.model_validate(t).model_dump() for t in tipos]
        
        return ResponseHandler.success_response(
            summary="Lista de tipos de disciplinas obtenida",
            message="Tipos de disciplinas encontrados",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar tipos de disciplinas",
            message=str(e)
        )


@router.get("/{external_id}", response_model=BaseResponse)
async def get_tipo(
    external_id: UUID,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    try:
        tipo = await service.get_tipo(external_id)
        if not tipo:
            return ResponseHandler.not_found_response(
                entity="Tipo de disciplina",
                message="Tipo no encontrado"
            )
        return ResponseHandler.success_response(
            summary="Tipo de disciplina encontrado",
            message="Detalle de tipo de disciplina obtenido",
            data=TipoDisciplinaOut.model_validate(tipo).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener tipo de disciplina",
            message=str(e)
        )


@router.put(
    "/{external_id}",
    response_model=BaseResponse,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def update_tipo(
    external_id: UUID,
    tipo_data: TipoDisciplinaUpdate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service)
):
    try:
        tipo = await service.update_tipo(external_id, tipo_data)
        if not tipo:
            return ResponseHandler.not_found_response(
                entity="Tipo de disciplina",
                message="Tipo no encontrado para actualización"
            )
        return ResponseHandler.success_response(
            summary="Tipo de disciplina actualizado con exito",
            message="Tipo de disciplina actualizado correctamente",
            data=TipoDisciplinaOut.model_validate(tipo).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al actualizar tipo de disciplina",
            message=str(e)
        )
