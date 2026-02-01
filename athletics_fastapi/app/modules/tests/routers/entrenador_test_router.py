"""
Entrenador Test Router - No Rate Limiting
Provides entrenador endpoints without rate limiting for testing.
"""
from fastapi import APIRouter, Depends, status, Query
from typing import List
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.entrenador.domain.schemas.entrenamiento_schema import (
    EntrenamientoResponse, EntrenamientoCreate, EntrenamientoUpdate
)
from app.modules.entrenador.domain.schemas.horario_schema import (
    HorarioCreate, HorarioResponse
)
from app.modules.entrenador.domain.schemas.registro_asistencias_schema import (
    RegistroAsistenciasCreate, RegistroAsistenciasResponse
)
from app.modules.entrenador.domain.schemas.asistencia_schema import (
    AsistenciaCreate, AsistenciaResponse
)
from app.modules.entrenador.domain.schemas.resultado_entrenamiento_schema import (
    ResultadoEntrenamientoCreate, ResultadoEntrenamientoRead, ResultadoEntrenamientoUpdate
)
from app.modules.entrenador.services.entrenamiento_service import EntrenamientoService
from app.modules.entrenador.services.horario_service import HorarioService
from app.modules.entrenador.services.asistencia_service import AsistenciaService
from app.modules.entrenador.services.resultado_entrenamiento_service import ResultadoEntrenamientoService
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.repositories.horario_repository import HorarioRepository
from app.modules.entrenador.repositories.registro_asistencias_repository import RegistroAsistenciasRepository
from app.modules.entrenador.repositories.asistencia_repository import AsistenciaRepository
from app.modules.entrenador.repositories.resultado_entrenamiento_repository import ResultadoEntrenamientoRepository
from app.modules.entrenador.dependencies import get_current_entrenador
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.user_model import UserModel

router = APIRouter(prefix="/entrenador")


# Dependencies
async def get_entrenamiento_service(session: AsyncSession = Depends(get_session)) -> EntrenamientoService:
    repo = EntrenamientoRepository(session)
    return EntrenamientoService(repo)


async def get_horario_service(session: AsyncSession = Depends(get_session)) -> HorarioService:
    repo = HorarioRepository(session)
    return HorarioService(repo)


async def get_asistencia_service(session: AsyncSession = Depends(get_session)) -> AsistenciaService:
    reg_repo = RegistroAsistenciasRepository(session)
    asis_repo = AsistenciaRepository(session)
    horario_repo = HorarioRepository(session)
    return AsistenciaService(reg_repo, asis_repo, horario_repo)


async def get_resultado_service(session: AsyncSession = Depends(get_session)) -> ResultadoEntrenamientoService:
    repo = ResultadoEntrenamientoRepository(session)
    return ResultadoEntrenamientoService(repo)


# ======================================================
# ENTRENAMIENTOS
# ======================================================

@router.post("/entrenamientos/", response_model=EntrenamientoResponse, status_code=status.HTTP_201_CREATED)
async def create_entrenamiento(
    entrenamiento_data: EntrenamientoCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """TEST: Create training session"""
    return await service.create_entrenamiento(entrenamiento_data, current_entrenador.id)


@router.get("/entrenamientos/", response_model=List[EntrenamientoResponse])
async def list_entrenamientos(
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """TEST: List my training sessions"""
    return await service.get_mis_entrenamientos(current_entrenador.id)


@router.get("/entrenamientos/{id}", response_model=EntrenamientoResponse)
async def get_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """TEST: Get training session detail"""
    return await service.get_entrenamiento_detalle(id, current_entrenador.id)


@router.put("/entrenamientos/{id}", response_model=EntrenamientoResponse)
async def update_entrenamiento(
    id: int,
    entrenamiento_update: EntrenamientoUpdate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """TEST: Update training session"""
    return await service.update_entrenamiento(id, entrenamiento_update, current_entrenador.id)


@router.delete("/entrenamientos/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """TEST: Delete training session"""
    await service.delete_entrenamiento(id, current_entrenador.id)


# ======================================================
# HORARIOS (SCHEDULES)
# ======================================================

@router.post("/horarios/", response_model=HorarioResponse, status_code=status.HTTP_201_CREATED)
async def create_horario(
    horario_data: HorarioCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """TEST: Create schedule"""
    return await service.create_horario(horario_data)


@router.get("/horarios/{entrenamiento_id}", response_model=List[HorarioResponse])
async def list_horarios(
    entrenamiento_id: int,
    service: HorarioService = Depends(get_horario_service)
):
    """TEST: List schedules for training"""
    return await service.get_horarios_by_entrenamiento(entrenamiento_id)


@router.delete("/horarios/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_horario(
    horario_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: HorarioService = Depends(get_horario_service)
):
    """TEST: Delete schedule"""
    await service.delete_horario(horario_id)


# ======================================================
# ASISTENCIAS (ATTENDANCE)
# ======================================================

@router.post("/inscripcion", response_model=RegistroAsistenciasResponse, status_code=status.HTTP_201_CREATED)
async def inscribir_atleta(
    data: RegistroAsistenciasCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Enroll athlete in schedule"""
    return await service.registrar_atleta_horario(data, current_entrenador.id)


@router.get("/inscripcion/", response_model=List[RegistroAsistenciasResponse])
async def listar_inscritos(
    horario_id: int = Query(...),
    current_user: UserModel = Depends(get_current_user),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: List enrolled athletes"""
    return await service.get_atletas_by_horario(horario_id)


@router.delete("/inscripcion/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_inscripcion(
    registro_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Remove enrollment"""
    await service.remove_atleta_horario(registro_id)


@router.post("/registro", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_asistencia(
    data: AsistenciaCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Create attendance record"""
    return await service.registrar_asistencia_diaria(data)


@router.post("/confirmar/{registro_id}", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def confirmar_asistencia(
    registro_id: int,
    fecha_entrenamiento: date = Query(...),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Athlete confirms attendance"""
    return await service.confirmar_asistencia_atleta(registro_id, fecha_entrenamiento)


@router.post("/rechazar/{registro_id}", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def rechazar_asistencia(
    registro_id: int,
    fecha_entrenamiento: date = Query(...),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Athlete rejects attendance"""
    return await service.rechazar_asistencia_atleta(registro_id, fecha_entrenamiento)


@router.put("/marcar-presente/{asistencia_id}", response_model=AsistenciaResponse)
async def marcar_presente(
    asistencia_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Mark present"""
    return await service.marcar_presente(asistencia_id)


@router.put("/marcar-ausente/{asistencia_id}", response_model=AsistenciaResponse)
async def marcar_ausente(
    asistencia_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """TEST: Mark absent"""
    return await service.marcar_ausente(asistencia_id)


@router.get("/mis-registros", response_model=List[RegistroAsistenciasResponse])
async def obtener_mis_registros(
    atleta_id: int = Query(...),
    service: AsistenciaService = Depends(get_asistencia_service),
):
    """TEST: Get my enrollment records"""
    return await service.get_registros_by_atleta(atleta_id)


# ======================================================
# RESULTADOS ENTRENAMIENTO
# ======================================================

@router.get("/resultados/", response_model=List[ResultadoEntrenamientoRead])
async def list_resultados(
    skip: int = 0,
    limit: int = 100,
    service: ResultadoEntrenamientoService = Depends(get_resultado_service)
):
    """TEST: List training results"""
    return await service.list_resultados(skip, limit)


@router.post("/resultados/", response_model=ResultadoEntrenamientoRead, status_code=status.HTTP_201_CREATED)
async def create_resultado(
    data: ResultadoEntrenamientoCreate,
    service: ResultadoEntrenamientoService = Depends(get_resultado_service)
):
    """TEST: Create training result"""
    return await service.create_resultado(data)


@router.put("/resultados/{resultado_id}", response_model=ResultadoEntrenamientoRead)
async def update_resultado(
    resultado_id: int,
    data: ResultadoEntrenamientoUpdate,
    service: ResultadoEntrenamientoService = Depends(get_resultado_service)
):
    """TEST: Update training result"""
    return await service.update_resultado(resultado_id, data)


@router.delete("/resultados/{resultado_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resultado(
    resultado_id: int,
    service: ResultadoEntrenamientoService = Depends(get_resultado_service)
):
    """TEST: Delete training result"""
    await service.delete_resultado(resultado_id)
