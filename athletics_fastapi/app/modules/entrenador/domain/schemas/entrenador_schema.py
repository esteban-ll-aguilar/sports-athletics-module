from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class EntrenadorBase(BaseModel):
    anios_experiencia: int = Field(..., ge=0)
    is_pasante: bool = False

class EntrenadorCreate(EntrenadorBase):
    pass

class EntrenadorUpdate(BaseModel):
    anios_experiencia: Optional[int] = Field(None, ge=0)
    is_pasante: Optional[bool] = None

class EntrenadorRead(EntrenadorBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)
