from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID


from app.modules.competencia.domain.schemas.resultado_prueba_schema import (
    ResultadoPruebaCreate,
    ResultadoPruebaUpdate,
    ResultadoPruebaRead
)

from app.modules.competencia.services.resultado_prueba_service import ResultadoPruebaService
from app.modules.competencia.repositories.resultado_prueba_repository import ResultadoPruebaRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.repositories.baremo_repository import BaremoRepository
from app.core.db.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

# Dependency Injection Helper
def get_resultado_prueba_service(db: AsyncSession = Depends(get_session)):
    return ResultadoPruebaService(
        repo=ResultadoPruebaRepository(db),
        atleta_repo=AtletaRepository(db),
        prueba_repo=PruebaRepository(db),
        baremo_repo=BaremoRepository(db)
    )

router = APIRouter()

@router.post("/", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def create_resultado_prueba(
    data: ResultadoPruebaCreate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    try:
        # Pass 0 or None for entrenador_id since it was removed from model, or update service signature
        nuevo_resultado = await service.create(data, 0)
        return ResponseHandler.success_response(
            summary="Resultado de prueba creado con exito",
            message="Resultado de prueba creado con exito",
            data=ResultadoPruebaRead.model_validate(nuevo_resultado).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear resultado de prueba",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/", response_model=BaseResponse)
async def get_all_resultados_prueba(
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    try:
        resultados = await service.get_all()
        if not resultados:
             return ResponseHandler.success_response(
                summary="No hay resultados de pruebas registrados",
                message="No se encontraron resultados de pruebas",
                data={"items": []}
            )
            
        items = [ResultadoPruebaRead.model_validate(r).model_dump() for r in resultados]
        
        return ResponseHandler.success_response(
            summary="Lista de resultados de pruebas obtenida",
            message="Resultados de pruebas encontrados",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar resultados de pruebas",
            message=str(e)
        )

@router.put("/{external_id}", response_model=BaseResponse)
async def update_resultado_prueba(
    external_id: UUID,
    data: ResultadoPruebaUpdate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    try:
        resultado = await service.update(external_id, data)
        return ResponseHandler.success_response(
            summary="Resultado de prueba actualizado con exito",
            message="Resultado de prueba actualizado correctamente",
            data=ResultadoPruebaRead.model_validate(resultado).model_dump()
        )
    except HTTPException as e:
         if e.status_code == status.HTTP_404_NOT_FOUND:
            return ResponseHandler.not_found_response(
                entity="Resultado de prueba",
                message="Resultado de prueba no encontrado"
            )
         return ResponseHandler.error_response(
            summary="Error al actualizar resultado de prueba",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e)
        )
