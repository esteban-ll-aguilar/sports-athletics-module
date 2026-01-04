from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import time
import uuid

class HorarioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    hora_inicio: time
    hora_fin: time

class HorarioCreate(HorarioBase):
    pass

class HorarioUpdate(BaseModel):
    name: Optional[str] = None
    hora_inicio: Optional[time] = None
    hora_fin: Optional[time] = None

class HorarioResponse(HorarioBase):
    id: int
    external_id: uuid.UUID
    entrenamiento_id: int
    
    model_config = ConfigDict(from_attributes=True)
