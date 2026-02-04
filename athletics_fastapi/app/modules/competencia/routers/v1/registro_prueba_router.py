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

# -------------------------------------------------------------------------
# INYECCIÓN DE DEPENDENCIAS (Dependency Injection Factory)
# -------------------------------------------------------------------------
def get_resultado_prueba_service(db: AsyncSession = Depends(get_session)):
    """
    Factory function que construye el servicio con todas sus dependencias.
    Inyecta los repositorios necesarios para realizar validaciones cruzadas.
    """
    return ResultadoPruebaService(
        repo=ResultadoPruebaRepository(db),
        atleta_repo=AtletaRepository(db),
        prueba_repo=PruebaRepository(db),
        baremo_repo=BaremoRepository(db)
    )

from ...dependencies import get_current_admin_or_entrenador

router = APIRouter()
# -------------------------------------------------------------------------
# ENDPOINT: POST / (Crear Resultado)
# -------------------------------------------------------------------------
@router.post("/", response_model=BaseResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_or_entrenador)])
async def create_resultado_prueba(
    data: ResultadoPruebaCreate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    """
    Registra un nuevo resultado de prueba para un atleta.
    
    **Proceso interno:**
    1. Verifica existencia del Atleta y la Prueba.
    2. Cruza la marca obtenida con la tabla de Baremos.
    3. Asigna automáticamente una clasificación (Excelente, Pobre, etc.).
    4. Persiste el registro en la base de datos.
    """
    try:
        # Registro de actividad en consola para depuración
        print(f"\n{'='*60}")
        print(f"📥 CREAR RESULTADO DE PRUEBA")
        print(f"{'='*60}")
        print(f"📦 Datos recibidos:")
        print(f"   - Atleta ID (UUID): {data.atleta_id}")
        print(f"   - Prueba ID (UUID): {data.prueba_id}")
        print(f"   - Marca obtenida: {data.marca_obtenida}")
        print(f"   - Fecha: {data.fecha}")
        print(f"   - Estado: {data.estado}")
        
        # Se envía 0 como marcador de posición para el ID del entrenador (ajuste de modelo)
        nuevo_resultado = await service.create(data, 0)
        
        print(f"\n✅ RESULTADO CREADO:")
        print(f"   - ID interno: {nuevo_resultado.id}")
        print(f"   - External ID: {nuevo_resultado.external_id}")
        print(f"   - Atleta ID: {nuevo_resultado.atleta_id}")
        print(f"   - Prueba ID: {nuevo_resultado.prueba_id}")
        print(f"   - Baremo ID: {nuevo_resultado.baremo_id}")
        print(f"   - Marca: {nuevo_resultado.marca_obtenida}")
        print(f"   - Clasificación: {nuevo_resultado.clasificacion_final}")
        print(f"{'='*60}\n")
        
        return ResponseHandler.success_response(
            summary="Resultado de prueba creado con exito",
            message="Resultado de prueba creado con exito",
            data=ResultadoPruebaRead.model_validate(nuevo_resultado).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except HTTPException as he:
        print(f"\n❌ HTTP EXCEPTION: {he.status_code} - {he.detail}\n")
        raise he
    except Exception as e:
        print(f"\n❌ ERROR INESPERADO: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        return ResponseHandler.error_response(
            summary="Error al crear resultado de prueba",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# -------------------------------------------------------------------------
# ENDPOINT: GET / (Listar Resultados)
# -------------------------------------------------------------------------
@router.get("/", response_model=BaseResponse)
async def get_all_resultados_prueba(
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    try:
        """
    Recupera el listado completo de resultados registrados.
    Realiza una hidratación manual para incluir datos del usuario (Nombre/ID) 
    y evitar que el frontend reciba solo UUIDs crudos.
    """
        resultados = await service.get_all()
        if not resultados:
             return ResponseHandler.success_response(
                summary="No hay resultados de pruebas registrados",
                message="No se encontraron resultados de pruebas",
                data={"items": []}
            )
            
        items = []
        for r in resultados:
            # Serialize the result
            result_dict = ResultadoPruebaRead.model_validate(r).model_dump()
            
            # Manually add atleta with user data if available
            if r.atleta:
                result_dict['atleta'] = {
                    'id': r.atleta.id,
                    'external_id': str(r.atleta.external_id),
                    'anios_experiencia': r.atleta.anios_experiencia,
                    'user_id': r.atleta.user_id,
                    'user': None
                }
                if r.atleta.user:
                    result_dict['atleta']['user'] = {
                        'id': r.atleta.user.id,
                        'first_name': r.atleta.user.first_name,
                        'last_name': r.atleta.user.last_name,
                        'identificacion': r.atleta.user.identificacion
                    }
            
            items.append(result_dict)
        
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
# -------------------------------------------------------------------------
# ENDPOINT: PUT /{external_id} (Actualizar)
# -------------------------------------------------------------------------
@router.put("/{external_id}", response_model=BaseResponse, dependencies=[Depends(get_current_admin_or_entrenador)])
async def update_resultado_prueba(
    external_id: UUID,
    data: ResultadoPruebaUpdate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    """
    Actualiza un resultado existente. Si la marca cambia, el sistema 
    recalcula la clasificación automáticamente.
    """
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
