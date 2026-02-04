"""Router para la gestión del catálogo de Pruebas Físicas."""
from fastapi import APIRouter, Depends, status
from uuid import UUID

from ...domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate, PruebaRead
from ...services.prueba_service import PruebaService
from ...dependencies import get_prueba_service, get_current_admin_or_entrenador
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()
# -------------------------------------------------------------------------
# ENDPOINT: Crear Prueba
# -------------------------------------------------------------------------
@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def create_prueba(
    data: PruebaCreate,
    service: PruebaService = Depends(get_prueba_service)
):
    """Registra una nueva prueba física en el catálogo maestro."""
    try:
        nueva_prueba = await service.create_prueba(data)
        return ResponseHandler.success_response(
            summary="Prueba creada con exito",
            message="Prueba creada con exito",
            data=PruebaRead.model_validate(nueva_prueba).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear prueba",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# -------------------------------------------------------------------------
# ENDPOINT: Listar Pruebas (Paginado)
# -------------------------------------------------------------------------
@router.get("/", response_model=BaseResponse)
async def list_pruebas(
    skip: int = 0,
    limit: int = 100,
    service: PruebaService = Depends(get_prueba_service)
):
    """Retorna el catálogo de pruebas con soporte para paginación."""
    try:
        pruebas = await service.get_pruebas(skip, limit)
        if not pruebas:
             return ResponseHandler.success_response(
                summary="No hay pruebas registradas",
                message="No se encontraron pruebas",
                data={"items": []}
            )
        
        items = [PruebaRead.model_validate(p).model_dump() for p in pruebas]
        
        return ResponseHandler.success_response(
            summary="Lista de pruebas obtenida",
            message="Pruebas encontradas",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar pruebas",
            message=str(e)
        )
# -------------------------------------------------------------------------
# ENDPOINT: Obtener Prueba por external id
# -------------------------------------------------------------------------
@router.get("/{external_id}", response_model=BaseResponse)
async def get_prueba(
    external_id: UUID,
    service: PruebaService = Depends(get_prueba_service)
):
    """Busca los detalles de una prueba específica por su UUID."""
    try:
        prueba = await service.get_prueba(external_id)
        if not prueba:
            return ResponseHandler.not_found_response(
                entity="Prueba",
                message="Prueba no encontrada"
            )
        return ResponseHandler.success_response(
            summary="Prueba encontrada",
            message="Detalle de prueba obtenido",
            data=PruebaRead.model_validate(prueba).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener prueba",
            message=str(e)
        )
# -------------------------------------------------------------------------
# ENDPOINT: Actualizar Prueba
# -------------------------------------------------------------------------
@router.put(
    "/{external_id}",
    response_model=BaseResponse,
    dependencies=[Depends(get_current_admin_or_entrenador)]
)
async def update_prueba(
    external_id: UUID,
    data: PruebaUpdate,
    service: PruebaService = Depends(get_prueba_service)
):
    """Actualiza la configuración de una prueba existente."""
    try:
        prueba = await service.update_prueba(external_id, data)
        if not prueba:
             return ResponseHandler.not_found_response(
                entity="Prueba",
                message="Prueba no encontrada para actualización"
            )
        return ResponseHandler.success_response(
            summary="Prueba actualizada con exito",
            message="Prueba actualizada correctamente",
            data=PruebaRead.model_validate(prueba).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al actualizar prueba",
            message=str(e)
        )
