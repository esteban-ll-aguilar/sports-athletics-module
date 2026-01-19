from pydantic import BaseModel, ConfigDict, Field
import uuid
from typing import Optional
from datetime import date, time, datetime

class AsistenciaBase(BaseModel):
    fecha_asistencia: date
    hora_llegada: time
    descripcion: Optional[str] = ""
    asistio: bool = False
    atleta_confirmo: Optional[bool] = None
    fecha_confirmacion: Optional[datetime] = None

class AsistenciaCreate(AsistenciaBase):
    registro_asistencias_id: int

class ConfirmacionAsistenciaCreate(BaseModel):
    """Schema para cuando el atleta confirma su asistencia"""
    registro_asistencias_id: int

class AsistenciaResponse(AsistenciaBase):
    id: int
    external_id: uuid.UUID
    registro_asistencias_id: int

    model_config = ConfigDict(from_attributes=True)
