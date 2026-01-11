from fastapi import HTTPException, status
from typing import List
from app.modules.entrenador.repositories.registro_asistencias_repository import RegistroAsistenciasRepository
from app.modules.entrenador.repositories.asistencia_repository import AsistenciaRepository
from app.modules.entrenador.repositories.horario_repository import HorarioRepository
from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
from app.modules.entrenador.domain.models.asistencia_model import Asistencia
from app.modules.entrenador.domain.schemas.registro_asistencias_schema import RegistroAsistenciasCreate
from app.modules.entrenador.domain.schemas.asistencia_schema import AsistenciaCreate

class AsistenciaService:
    def __init__(
        self, 
        registro_repo: RegistroAsistenciasRepository, 
        asistencia_repo: AsistenciaRepository,
        horario_repo: HorarioRepository
    ):
        self.registro_repo = registro_repo
        self.asistencia_repo = asistencia_repo
        self.horario_repo = horario_repo

    # --- Enrollment Logic (Atleta -> Horario) ---

    async def registrar_atleta_horario(self, schema: RegistroAsistenciasCreate, entrenador_id: int) -> RegistroAsistencias:
        # 1. Verify Horario exists and belongs to Entrenador (indirectly via Entrenamiento)
        # Assuming HorarioRepo or we can use EntrenamientoRepo. 
        # For simplicity, verifying Horario ID existence first.
        # Ideally we check permission. Let's assume we implement a check helper in HorarioRepo or similar.
        # For now, simplistic check:
        horario = await self.horario_repo.get_by_id(schema.horario_id)
        if not horario:
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

        # 2. Check if already enrolled
        existing = await self.registro_repo.get_by_atleta_and_horario(schema.atleta_id, schema.horario_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El atleta ya está registrado en este horario")

        # 3. Create
        registro = RegistroAsistencias(**schema.model_dump())
        return await self.registro_repo.create(registro)

    async def get_atletas_by_horario(self, horario_id: int) -> List[RegistroAsistencias]:
        return await self.registro_repo.get_by_horario(horario_id)

    async def remove_atleta_horario(self, registro_id: int) -> None:
        # TODO: Implement get_by_id in repo if needed
        pass

    # --- Daily Attendance Logic ---

    async def registrar_asistencia_diaria(self, schema: AsistenciaCreate) -> Asistencia:
        # 1. Verify enrollment exists
        # We assume checking registro_asistencias_id implies checking if the student is valid for that schedule.
        # But `registro_asistencias_id` IS the enrollment ID.
        
        asistencia = Asistencia(**schema.model_dump())
        return await self.asistencia_repo.create(asistencia)

    async def get_asistencias_by_enrollment(self, registro_asistencias_id: int) -> List[Asistencia]:
        return await self.asistencia_repo.get_by_registro_asistencias(registro_asistencias_id)
