from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoRead, BaremoUpdate
)
from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.dependencies import get_baremo_service, get_current_admin_or_entrenador
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()

# ----------------------
# Create Baremo (protegido)
# ----------------------
@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_baremo(
    data: BaremoCreate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    try:
        nuevo_baremo = await service.create(data)
        return ResponseHandler.success_response(
            summary="Baremo creado con exito",
            message="Baremo creado con exito",
            data=BaremoRead.model_validate(nuevo_baremo).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear baremo",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ----------------------
# List Baremos (público)
# ----------------------
@router.get("/", response_model=BaseResponse)
async def list_baremos(
    incluir_inactivos: bool = True,
    service: BaremoService = Depends(get_baremo_service)
):
    try:
        baremos = await service.get_all(incluir_inactivos)
        if not baremos:
             return ResponseHandler.success_response(
                summary="No hay baremos registrados",
                message="No se encontraron baremos",
                data={"items": []}
            )
        
        items = [BaremoRead.model_validate(b).model_dump() for b in baremos]
        
        return ResponseHandler.success_response(
            summary="Lista de baremos obtenida",
            message="Baremos encontrados",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar baremos",
            message=str(e)
        )

# ----------------------
# Get Baremo by ID (público)
# ----------------------
@router.get("/{external_id}", response_model=BaseResponse)
async def get_baremo(
    external_id: UUID,
    service: BaremoService = Depends(get_baremo_service)
):
    try:
        baremo = await service.get(external_id)
        if not baremo:
            return ResponseHandler.not_found_response(
                entity="Baremo",
                message="Baremo no encontrado"
            )
        return ResponseHandler.success_response(
            summary="Baremo encontrado",
            message="Detalle de baremo obtenido",
            data=BaremoRead.model_validate(baremo).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener baremo",
            message=str(e)
        )

# ----------------------
# Update Baremo (protegido)
# ----------------------
@router.put(
    "/{external_id}",
    response_model=BaseResponse
)
async def update_baremo(
    external_id: UUID,
    data: BaremoUpdate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    try:
        baremo = await service.update(external_id, data)
        return ResponseHandler.success_response(
            summary="Baremo actualizado con exito",
            message="Baremo actualizado correctamente",
            data=BaremoRead.model_validate(baremo).model_dump()
        )
    except HTTPException as e:
         return ResponseHandler.error_response(
            summary="Error al actualizar baremo",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e)
        )

