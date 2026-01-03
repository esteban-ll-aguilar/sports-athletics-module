from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date
import uuid

class EntrenamientoBase(BaseModel):
    tipo_entrenamiento: str
    descripcion: str
    fecha_entrenamiento: date

class EntrenamientoCreate(EntrenamientoBase):
    pass

class EntrenamientoUpdate(BaseModel):
    tipo_entrenamiento: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_entrenamiento: Optional[date] = None

class EntrenamientoResponse(EntrenamientoBase):
    id: int
    external_id: uuid.UUID
    entrenador_id: int
    
    model_config = ConfigDict(from_attributes=True)
