from pydantic import BaseModel, ConfigDict, Field
from app.modules.entrenador.domain.schemas.horario_schema import HorarioBase, HorarioResponse
from typing import Optional, List
from datetime import date
import uuid

class EntrenamientoBase(BaseModel):
    tipo_entrenamiento: str = Field(..., min_length=1, max_length=100)
    descripcion: str = Field(..., min_length=1, max_length=500)
    fecha_entrenamiento: date

class EntrenamientoCreate(EntrenamientoBase):
    horarios: Optional[List[HorarioBase]] = []

class EntrenamientoUpdate(BaseModel):
    tipo_entrenamiento: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_entrenamiento: Optional[date] = None
    horarios: Optional[List[HorarioBase]] = None

class EntrenamientoResponse(EntrenamientoBase):
    id: int
    external_id: uuid.UUID
    entrenador_id: int
    horarios: List[HorarioResponse] = []

    
    model_config = ConfigDict(from_attributes=True)
