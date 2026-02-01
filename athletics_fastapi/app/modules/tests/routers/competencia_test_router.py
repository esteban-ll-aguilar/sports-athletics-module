"""
Competencia Test Router - No Rate Limiting
Provides competencia endpoints without rate limiting for testing.
Includes: competencias, pruebas, resultados, baremos, tipo_disciplina, registros
"""
from fastapi import APIRouter, Depends, status
from uuid import UUID
from typing import List

from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.competencia.services.competencia_service import CompetenciaService
from app.modules.competencia.services.prueba_service import PruebaService
from app.modules.competencia.services.resultado_competencia_service import ResultadoCompetenciaService
from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.services.tipo_disciplina_service import TipoDisciplinaService
from app.modules.competencia.services.registro_prueba_competencia_service import RegistroPruebaCompetenciaService
from app.modules.competencia.dependencies import (
    get_competencia_service,
    get_prueba_service,
    get_resultado_competencia_service,
    get_baremo_service,
    get_tipo_disciplina_service,
    get_registro_prueba_competencia_service,
)
from app.modules.competencia.domain.schemas.competencia_schema import (
    CompetenciaCreate, CompetenciaUpdate, CompetenciaRead,
    ResultadoCompetenciaCreate, ResultadoCompetenciaUpdate, ResultadoCompetenciaRead
)
from app.modules.competencia.domain.schemas.prueba_schema import (
    PruebaCreate, PruebaUpdate, PruebaRead
)
from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoUpdate, BaremoRead
)
from app.modules.competencia.domain.schemas.tipo_disciplina_schema import (
    TipoDisciplinaCreate, TipoDisciplinaUpdate, TipoDisciplinaOut
)
from app.modules.competencia.domain.schemas.registro_prueba_competencia_schema import (
    RegistroPruebaCompetenciaCreate, RegistroPruebaCompetenciaResponse
)
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter(prefix="/competencia")


# ======================================================
# COMPETENCIAS
# ======================================================

@router.post("/competencias", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_competencia(
    data: CompetenciaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """TEST: Create competition"""
    nueva_competencia = await service.create(data, current_user.id)
    return ResponseHandler.success_response(
        summary="Competencia creada",
        message="Competencia creada (TEST)",
        data=CompetenciaRead.model_validate(nueva_competencia).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/competencias", response_model=BaseResponse)
async def listar_competencias(
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
    incluir_inactivos: bool = True,
):
    """TEST: List competitions"""
    competencias = await service.get_all(incluir_inactivos, None)
    items = [CompetenciaRead.model_validate(c).model_dump() for c in competencias]
    return ResponseHandler.success_response(
        summary="Lista de competencias",
        message="Competencias obtenidas (TEST)",
        data={"items": items}
    )


@router.get("/competencias/{external_id}", response_model=BaseResponse)
async def obtener_competencia(
    external_id: UUID,
    service: CompetenciaService = Depends(get_competencia_service),
):
    """TEST: Get competition by UUID"""
    competencia = await service.get(external_id)
    return ResponseHandler.success_response(
        summary="Competencia obtenida",
        message="Competencia encontrada (TEST)",
        data=CompetenciaRead.model_validate(competencia).model_dump()
    )


@router.put("/competencias/{external_id}", response_model=BaseResponse)
async def actualizar_competencia(
    external_id: UUID,
    data: CompetenciaUpdate,
    service: CompetenciaService = Depends(get_competencia_service),
):
    """TEST: Update competition"""
    competencia = await service.update(external_id, data)
    return ResponseHandler.success_response(
        summary="Competencia actualizada",
        message="Actualización exitosa (TEST)",
        data=CompetenciaRead.model_validate(competencia).model_dump()
    )


@router.delete("/competencias/{external_id}", response_model=BaseResponse)
async def eliminar_competencia(
    external_id: UUID,
    service: CompetenciaService = Depends(get_competencia_service),
):
    """TEST: Delete competition"""
    await service.delete(external_id)
    return ResponseHandler.success_response(
        summary="Competencia eliminada",
        message="Eliminación exitosa (TEST)"
    )


# ======================================================
# PRUEBAS (EVENTS)
# ======================================================

@router.post("/pruebas", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_prueba(
    data: PruebaCreate,
    service: PruebaService = Depends(get_prueba_service),
):
    """TEST: Create test/event"""
    prueba = await service.create(data)
    return ResponseHandler.success_response(
        summary="Prueba creada",
        message="Prueba creada (TEST)",
        data=PruebaRead.model_validate(prueba).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/pruebas/", response_model=BaseResponse)
async def listar_pruebas(
    service: PruebaService = Depends(get_prueba_service),
):
    """TEST: List tests"""
    pruebas = await service.get_all()
    items = [PruebaRead.model_validate(p).model_dump() for p in pruebas]
    return ResponseHandler.success_response(
        summary="Lista de pruebas",
        message="Pruebas obtenidas (TEST)",
        data={"items": items}
    )


@router.get("/pruebas/{external_id}", response_model=BaseResponse)
async def obtener_prueba(
    external_id: UUID,
    service: PruebaService = Depends(get_prueba_service),
):
    """TEST: Get test by UUID"""
    prueba = await service.get(external_id)
    return ResponseHandler.success_response(
        summary="Prueba obtenida",
        message="Prueba encontrada (TEST)",
        data=PruebaRead.model_validate(prueba).model_dump()
    )


@router.put("/pruebas/{external_id}", response_model=BaseResponse)
async def actualizar_prueba(
    external_id: UUID,
    data: PruebaUpdate,
    service: PruebaService = Depends(get_prueba_service),
):
    """TEST: Update test"""
    prueba = await service.update(external_id, data)
    return ResponseHandler.success_response(
        summary="Prueba actualizada",
        message="Actualización exitosa (TEST)",
        data=PruebaRead.model_validate(prueba).model_dump()
    )


# ======================================================
# RESULTADOS COMPETENCIA
# ======================================================

@router.post("/resultados", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_resultado(
    data: ResultadoCompetenciaCreate,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """TEST: Create competition result"""
    resultado = await service.create(data)
    return ResponseHandler.success_response(
        summary="Resultado creado",
        message="Resultado creado (TEST)",
        data=ResultadoCompetenciaRead.model_validate(resultado).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/resultados", response_model=BaseResponse)
async def listar_resultados(
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """TEST: List results"""
    resultados = await service.get_all()
    items = [ResultadoCompetenciaRead.model_validate(r).model_dump() for r in resultados]
    return ResponseHandler.success_response(
        summary="Lista de resultados",
        message="Resultados obtenidos (TEST)",
        data={"items": items}
    )


@router.get("/resultados/competencia/{competencia_id}", response_model=BaseResponse)
async def resultados_by_competencia(
    competencia_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """TEST: Results by competition"""
    resultados = await service.get_by_competencia(competencia_id)
    items = [ResultadoCompetenciaRead.model_validate(r).model_dump() for r in resultados]
    return ResponseHandler.success_response(
        summary="Resultados por competencia",
        message="Resultados obtenidos (TEST)",
        data={"items": items}
    )


@router.get("/resultados/{external_id}", response_model=BaseResponse)
async def obtener_resultado(
    external_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """TEST: Get result by UUID"""
    resultado = await service.get(external_id)
    return ResponseHandler.success_response(
        summary="Resultado obtenido",
        message="Resultado encontrado (TEST)",
        data=ResultadoCompetenciaRead.model_validate(resultado).model_dump()
    )


@router.put("/resultados/{external_id}", response_model=BaseResponse)
async def actualizar_resultado(
    external_id: UUID,
    data: ResultadoCompetenciaUpdate,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """TEST: Update result"""
    resultado = await service.update(external_id, data)
    return ResponseHandler.success_response(
        summary="Resultado actualizado",
        message="Actualización exitosa (TEST)",
        data=ResultadoCompetenciaRead.model_validate(resultado).model_dump()
    )


# ======================================================
# BAREMOS (SCORING SYSTEMS)
# ======================================================

@router.post("/baremos", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_baremo(
    data: BaremoCreate,
    service: BaremoService = Depends(get_baremo_service),
):
    """TEST: Create baremo"""
    baremo = await service.create(data)
    return ResponseHandler.success_response(
        summary="Baremo creado",
        message="Baremo creado (TEST)",
        data=BaremoRead.model_validate(baremo).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/baremos/", response_model=BaseResponse)
async def listar_baremos(
    service: BaremoService = Depends(get_baremo_service),
):
    """TEST: List baremos"""
    baremos = await service.get_all()
    items = [BaremoRead.model_validate(b).model_dump() for b in baremos]
    return ResponseHandler.success_response(
        summary="Lista de baremos",
        message="Baremos obtenidos (TEST)",
        data={"items": items}
    )


@router.get("/baremos/{external_id}", response_model=BaseResponse)
async def obtener_baremo(
    external_id: UUID,
    service: BaremoService = Depends(get_baremo_service),
):
    """TEST: Get baremo by UUID"""
    baremo = await service.get(external_id)
    return ResponseHandler.success_response(
        summary="Baremo obtenido",
        message="Baremo encontrado (TEST)",
        data=BaremoRead.model_validate(baremo).model_dump()
    )


@router.put("/baremos/{external_id}", response_model=BaseResponse)
async def actualizar_baremo(
    external_id: UUID,
    data: BaremoUpdate,
    service: BaremoService = Depends(get_baremo_service),
):
    """TEST: Update baremo"""
    baremo = await service.update(external_id, data)
    return ResponseHandler.success_response(
        summary="Baremo actualizado",
        message="Actualización exitosa (TEST)",
        data=BaremoRead.model_validate(baremo).model_dump()
    )


# ======================================================
# TIPO DISCIPLINA
# ======================================================

@router.post("/tipo-disciplina", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_tipo_disciplina(
    data: TipoDisciplinaCreate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service),
):
    """TEST: Create discipline type"""
    tipo = await service.create(data)
    return ResponseHandler.success_response(
        summary="Tipo de disciplina creado",
        message="Creación exitosa (TEST)",
        data=TipoDisciplinaOut.model_validate(tipo).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/tipo-disciplina/", response_model=BaseResponse)
async def listar_tipos_disciplina(
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service),
):
    """TEST: List discipline types"""
    tipos = await service.get_all()
    items = [TipoDisciplinaOut.model_validate(t).model_dump() for t in tipos]
    return ResponseHandler.success_response(
        summary="Lista de tipos de disciplina",
        message="Tipos obtenidos (TEST)",
        data={"items": items}
    )


@router.get("/tipo-disciplina/{external_id}", response_model=BaseResponse)
async def obtener_tipo_disciplina(
    external_id: UUID,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service),
):
    """TEST: Get discipline type by UUID"""
    tipo = await service.get(external_id)
    return ResponseHandler.success_response(
        summary="Tipo de disciplina obtenido",
        message="Tipo encontrado (TEST)",
        data=TipoDisciplinaOut.model_validate(tipo).model_dump()
    )


@router.put("/tipo-disciplina/{external_id}", response_model=BaseResponse)
async def actualizar_tipo_disciplina(
    external_id: UUID,
    data: TipoDisciplinaUpdate,
    service: TipoDisciplinaService = Depends(get_tipo_disciplina_service),
):
    """TEST: Update discipline type"""
    tipo = await service.update(external_id, data)
    return ResponseHandler.success_response(
        summary="Tipo actualizado",
        message="Actualización exitosa (TEST)",
        data=TipoDisciplinaOut.model_validate(tipo).model_dump()
    )


# ======================================================
# REGISTRO PRUEBA COMPETENCIA
# ======================================================

@router.post("/registro-prueba", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_registro_prueba(
    data: RegistroPruebaCompetenciaCreate,
    service: RegistroPruebaCompetenciaService = Depends(get_registro_prueba_competencia_service),
):
    """TEST: Register test for competition"""
    registro = await service.create(data)
    return ResponseHandler.success_response(
        summary="Registro creado",
        message="Registro creado (TEST)",
        data=RegistroPruebaCompetenciaResponse.model_validate(registro).model_dump(),
        status_code=status.HTTP_201_CREATED
    )


@router.get("/registro-prueba/competencia/{competencia_id}", response_model=BaseResponse)
async def listar_registros_by_competencia(
    competencia_id: UUID,
    service: RegistroPruebaCompetenciaService = Depends(get_registro_prueba_competencia_service),
):
    """TEST: List registrations by competition"""
    registros = await service.get_by_competencia(competencia_id)
    items = [RegistroPruebaCompetenciaResponse.model_validate(r).model_dump() for r in registros]
    return ResponseHandler.success_response(
        summary="Registros obtenidos",
        message="Registros obtenidos (TEST)",
        data={"items": items}
    )
