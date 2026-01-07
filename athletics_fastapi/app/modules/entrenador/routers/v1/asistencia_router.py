from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.entrenador.domain.schemas.registro_asistencias_schema import RegistroAsistenciasCreate, RegistroAsistenciasResponse
from app.modules.entrenador.domain.schemas.asistencia_schema import AsistenciaCreate, AsistenciaResponse
from app.modules.entrenador.services.asistencia_service import AsistenciaService
from app.modules.entrenador.repositories.registro_asistencias_repository import RegistroAsistenciasRepository
from app.modules.entrenador.repositories.asistencia_repository import AsistenciaRepository
from app.modules.entrenador.repositories.horario_repository import HorarioRepository
from app.modules.entrenador.dependencies import get_current_entrenador

router = APIRouter(
    prefix="/asistencias",
    tags=["Entrenador - Asistencias"]
)

async def get_asistencia_service(session: AsyncSession = Depends(get_session)) -> AsistenciaService:
    reg_repo = RegistroAsistenciasRepository(session)
    asis_repo = AsistenciaRepository(session)
    horario_repo = HorarioRepository(session)
    return AsistenciaService(reg_repo, asis_repo, horario_repo)

# --- Enrollment Endpoints ---

@router.post("/inscripcion", response_model=RegistroAsistenciasResponse, status_code=status.HTTP_201_CREATED)
async def inscribir_atleta(
    data: RegistroAsistenciasCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Inscribe un atleta en un horario específico (RegistroAsistencias).
    """
    return await service.registrar_atleta_horario(data, current_entrenador.id)

@router.get("/inscripcion/horario/{horario_id}", response_model=List[RegistroAsistenciasResponse])
async def listar_inscritos(
    horario_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Lista los atletas inscritos en un horario.
    """
    return await service.get_atletas_by_horario(horario_id)

# --- Daily Attendance Endpoints ---

@router.post("/registro", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_asistencia(
    data: AsistenciaCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Registra la asistencia diaria de un atleta (vinculado a su inscripción).
    """
    return await service.registrar_asistencia_diaria(data)
