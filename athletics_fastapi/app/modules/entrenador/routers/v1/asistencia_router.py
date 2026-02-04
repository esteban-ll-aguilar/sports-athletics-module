from fastapi import APIRouter, Depends, status, Query
from typing import List
from datetime import date
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
    Inscribe un atleta en un horario específico (crea un RegistroAsistencias).
    
    Requiere ser entrenador.
    """
    return await service.registrar_atleta_horario(data, current_entrenador.id)

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.user_model import UserModel

@router.get("/inscripcion/horario/{horario_id}", response_model=List[RegistroAsistenciasResponse])
async def listar_inscritos(
    horario_id: int,
    current_user: UserModel = Depends(get_current_user),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Lista todos los atletas que están inscritos en un horario determinado.
    
    Disponible para usuarios autenticados (Entrenadores para ver sus alumnos, Atletas para ver compañeros, etc.).
    """
    return await service.get_atletas_by_horario(horario_id)

# --- Daily Attendance Endpoints ---

@router.delete("/inscripcion/{registro_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_inscripcion(
    registro_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Elimina la inscripción de un atleta de un horario (desinscribir).
    """
    await service.remove_atleta_horario(registro_id)

@router.post("/registro", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def registrar_asistencia(
    data: AsistenciaCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Crea manualmente un registro de asistencia diaria para un atleta inscrito.
    """
    return await service.registrar_asistencia_diaria(data)

# --- NEW: Confirmación y Control de Asistencia ---

@router.post("/confirmar/{registro_id}", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def confirmar_asistencia(
    registro_id: int,
    fecha_entrenamiento: date = Query(..., description="Fecha del entrenamiento"),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Endpoint para que un atleta confirme su asistencia a un próximo entrenamiento.
    
    Genera un registro de asistencia con estado de confirmación positivo.
    """
    return await service.confirmar_asistencia_atleta(registro_id, fecha_entrenamiento)

@router.post("/rechazar/{registro_id}", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
async def rechazar_asistencia(
    registro_id: int,
    fecha_entrenamiento: date = Query(..., description="Fecha del entrenamiento"),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Endpoint para que un atleta notifique que NO asistirá a un entrenamiento.
    """
    return await service.rechazar_asistencia_atleta(registro_id, fecha_entrenamiento)

@router.put("/marcar-presente/{asistencia_id}", response_model=AsistenciaResponse)
async def marcar_presente(
    asistencia_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Actualiza una asistencia para marcar que el atleta estuvo presente.
    """
    return await service.marcar_presente(asistencia_id)

@router.put("/marcar-ausente/{asistencia_id}", response_model=AsistenciaResponse)
async def marcar_ausente(
    asistencia_id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: AsistenciaService = Depends(get_asistencia_service)
):
    """
    Actualiza una asistencia para marcar que el atleta estuvo ausente.
    """
    return await service.marcar_ausente(asistencia_id)

@router.get("/mis-registros", response_model=List[RegistroAsistenciasResponse])
async def obtener_mis_registros(
    atleta_id: int = Query(..., description="ID del atleta"),
    service: AsistenciaService = Depends(get_asistencia_service),
    session: AsyncSession = Depends(get_session)
):
    """
    Devuelve lista de entenamientos/horarios en los que está inscrito un atleta (para su vista de calendario o listado).
    """
    from app.modules.entrenador.repositories.registro_asistencias_repository import RegistroAsistenciasRepository
    from sqlalchemy import select
    from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
    from sqlalchemy.orm import selectinload
    from app.modules.atleta.domain.models.atleta_model import Atleta
    from app.modules.entrenador.domain.models.horario_model import Horario
    from app.modules.auth.domain.models.user_model import UserModel
    
    from app.modules.entrenador.domain.models.entrenador_model import Entrenador
    from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
    
    # Using alias for clarity if needed, but direct imports work with selectinload
    
    repo = RegistroAsistenciasRepository(session)
    result = await session.execute(
        select(RegistroAsistencias)
        .where(RegistroAsistencias.atleta_id == atleta_id)
        .options(
            selectinload(RegistroAsistencias.horario)
                .selectinload(Horario.entrenamiento)
                .selectinload(Entrenamiento.entrenador)
                .selectinload(Entrenador.user),
            selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
            selectinload(RegistroAsistencias.asistencias)
        )
    )
    return result.scalars().all()
