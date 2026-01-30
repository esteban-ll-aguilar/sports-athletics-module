from fastapi import HTTPException, status
from typing import List
from datetime import date, time, datetime
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
        """
        Elimina la inscripción de un atleta.
        """
        registro = await self.registro_repo.get_by_id(registro_id)
        if not registro:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inscripción no encontrada")
        
        await self.registro_repo.delete(registro)

    # --- Daily Attendance Logic ---

    async def registrar_asistencia_diaria(self, schema: AsistenciaCreate) -> Asistencia:
        # 1. Verify enrollment exists
        # We assume checking registro_asistencias_id implies checking if the student is valid for that schedule.
        # But `registro_asistencias_id` IS the enrollment ID.
        
        asistencia = Asistencia(**schema.model_dump())
        return await self.asistencia_repo.create(asistencia)

    async def get_asistencias_by_enrollment(self, registro_asistencias_id: int) -> List[Asistencia]:
        return await self.asistencia_repo.get_by_registro_asistencias(registro_asistencias_id)
    
    # --- NEW: Confirmación de Atleta ---
    
    
    async def confirmar_asistencia_atleta(self, registro_id: int, fecha_entrenamiento: date) -> Asistencia:
        """
        El atleta confirma que asistirá. Crea un registro de Asistencia con fecha_confirmacion.
        """
        # 1. Verificar que el registro existe
        registro = await self.registro_repo.get_by_id(registro_id)
        if not registro:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
        
        # 2. Verificar si ya existe registro para esta fecha
        existing = await self.asistencia_repo.get_by_registro_and_date(registro_id, fecha_entrenamiento)
        
        if existing:
            # Si existe y ya confirmó positivamente
            if existing.fecha_confirmacion and existing.atleta_confirmo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Ya has confirmado tu asistencia para este entrenamiento"
                )
            
            # Si existe pero había rechazado o estaba pendiente, actualizamos a confirmado
            existing.atleta_confirmo = True
            existing.fecha_confirmacion = datetime.now()
            return await self.asistencia_repo.update(existing)
        
        # 3. Crear registro de confirmación
        asistencia = Asistencia(
            registro_asistencias_id=registro_id,
            fecha_asistencia=fecha_entrenamiento,
            hora_llegada=time(0, 0, 0),  # Placeholder
            descripcion="Confirmado por atleta",
            asistio=False,
            atleta_confirmo=True,
            fecha_confirmacion=datetime.now()
        )
        
        return await self.asistencia_repo.create(asistencia)

    async def rechazar_asistencia_atleta(self, registro_id: int, fecha_entrenamiento: date) -> Asistencia:
        """
        El atleta indica que NO asistirá.
        """
        # 1. Verificar que el registro existe
        registro = await self.registro_repo.get_by_id(registro_id)
        if not registro:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
        
        # 2. Verificar si ya existe registro
        existing = await self.asistencia_repo.get_by_registro_and_date(registro_id, fecha_entrenamiento)
        
        if existing:
            # Actualizamos a rechazado
            existing.atleta_confirmo = False
            existing.fecha_confirmacion = datetime.now()
            # Opcional: Podríamos limpiar 'asistio' si queremos asegurar consistencia
            existing.asistio = False 
            return await self.asistencia_repo.update(existing)
        
        # 3. Crear registro de rechazo
        asistencia = Asistencia(
            registro_asistencias_id=registro_id,
            fecha_asistencia=fecha_entrenamiento,
            hora_llegada=time(0, 0, 0),
            descripcion="Rechazado por atleta",
            asistio=False,
            atleta_confirmo=False,
            fecha_confirmacion=datetime.now()
        )
        
        return await self.asistencia_repo.create(asistencia)
    
    async def marcar_presente(self, asistencia_id: int) -> Asistencia:
        """
        El entrenador marca al atleta como presente.
        """
        asistencia = await self.asistencia_repo.get_by_id(asistencia_id)
        if not asistencia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asistencia no encontrada")
        
        # Actualizar estado
        asistencia.asistio = True
        asistencia.hora_llegada = datetime.now().time()
        
        return await self.asistencia_repo.update(asistencia)
    
    async def marcar_ausente(self, asistencia_id: int) -> Asistencia:
        """
        El entrenador confirma que el atleta no asistió (mantiene asistio=False).
        """
        asistencia = await self.asistencia_repo.get_by_id(asistencia_id)
        if not asistencia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asistencia no encontrada")
        
        # Asegurarse de que está marcado como ausente
        asistencia.asistio = False
        
        return await self.asistencia_repo.update(asistencia)
