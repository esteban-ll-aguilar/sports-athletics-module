from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID

from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoRead, BaremoUpdate
)
from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.dependencies import get_baremo_service, get_current_admin_or_entrenador
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler
# Definición del router para el recurso 'Baremo'
router = APIRouter()

# ----------------------
# Create Baremo (protegido)
# ----------------------
@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo baremo",
    description="Registra un nuevo criterio de calificación (baremo) en el sistema para una prueba específica."
)
async def create_baremo(
    data: BaremoCreate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    """
    Registra un nuevo baremo en el sistema.
    Requiere permisos de Administrador o Entrenador.
    """
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
@router.get(
    "/", 
    response_model=BaseResponse,
    summary="Listar todos los baremos",
    description="Obtiene el catálogo completo de baremos configurados para las distintas disciplinas."
)
async def list_baremos(
    incluir_inactivos: bool = True,
    service: BaremoService = Depends(get_baremo_service)
):
    """
    Retorna la lista de todos los baremos configurados.
    Endpoint público (o según política de dependencias globales).
    """
    try:
        baremos = await service.get_all(incluir_inactivos)
        # Manejo de lista vacía para evitar errores en el cliente
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
@router.get(
    "/{external_id}", 
    response_model=BaseResponse,
    summary="Obtener detalle de baremo",
    description="Recupera la información técnica y administrativa de un baremo por su UUID."
)
async def get_baremo(
    external_id: UUID,
    service: BaremoService = Depends(get_baremo_service)
):
    try:
        """
    Busca un baremo específico utilizando su identificador externo (UUID).
    """
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
    response_model=BaseResponse,
    summary="Actualizar baremo",
    description="Permite modificar los valores o metadatos de un baremo existente."
)
async def update_baremo(
    external_id: UUID,
    data: BaremoUpdate,
    service: BaremoService = Depends(get_baremo_service),
    current_user = Depends(get_current_admin_or_entrenador)  # Protección explícita
):
    """
    Actualiza la información de un baremo existente.
    Protegido para roles de gestión.
    """
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

