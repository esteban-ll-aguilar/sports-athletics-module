"""Router para el registro de resultados de pruebas dentro de competencias."""
from fastapi import APIRouter, Depends, status
from uuid import UUID

from app.modules.competencia.domain.schemas.registro_prueba_competencia_schema import (
    RegistroPruebaCompetenciaCreate,
    RegistroPruebaCompetenciaUpdate,
    RegistroPruebaCompetenciaResponse
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

# -------------------------------------------------------------------------
# CREATE: Registrar una prueba en una competencia
# -------------------------------------------------------------------------
@router.post(
    "/",
    response_model=BaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Vincular prueba a competencia",
    description="Crea una asociación entre una prueba física y un evento de competencia."
)
async def create_registro(
    data: RegistroPruebaCompetenciaCreate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    """Crea un nuevo registro que vincula una prueba específica a una competencia."""
    try:
        print(f"📥 Datos recibidos: {data.model_dump()}")
        nuevo_registro = await service.create(data)
        return ResponseHandler.success_response(
            summary="Registro creado con exito",
            message="Registro creado con exito",
            data=RegistroPruebaCompetenciaResponse.model_validate(nuevo_registro).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    # Implementación de traceback para identificar errores de clave foránea o lógica
    except Exception as e:
        print(f"❌ Error al crear registro: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return ResponseHandler.error_response(
            summary="Error al crear registro",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -------------------------------------------------------------------------
# GET ALL: Listado global de registros
# -------------------------------------------------------------------------
@router.get(
    "/",
    response_model=BaseResponse,
    summary="Listar todos los vínculos prueba-competencia",
    description="Obtiene todos los registros de pruebas asociadas a competencias en el sistema."
)
async def get_all_registros(
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    """Obtiene todos los registros de pruebas/competencias con su totalizador."""
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

# -------------------------------------------------------------------------
# GET ONE: Detalle por ID Externo
# -------------------------------------------------------------------------
@router.get(
    "/{external_id}",
    response_model=BaseResponse,
    summary="Obtener detalle de vínculo",
    description="Recupera la información técnica del vínculo entre una prueba y una competencia."
)
async def get_registro(
    external_id: UUID,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    """Recupera un registro específico mediante su identificador único UUID."""
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


# -------------------------------------------------------------------------
# UPDATE: Modificar registro existente
# -------------------------------------------------------------------------
@router.put(
    "/{external_id}",
    response_model=BaseResponse,
    summary="Actualizar vínculo",
    description="Modifica un registro de vinculación existente."
)
async def update_registro(
    external_id: UUID,
    data: RegistroPruebaCompetenciaUpdate,
    service: RegistroPruebaCompetenciaService = Depends(
        get_registro_prueba_competencia_service
    )
):
    """Actualiza los datos (como puntajes o estados) de un registro existente."""
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
