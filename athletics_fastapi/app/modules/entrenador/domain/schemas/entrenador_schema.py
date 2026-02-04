from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class EntrenadorBase(BaseModel):
    anios_experiencia: int = Field(..., ge=0)
    is_pasante: bool = False

class EntrenadorCreate(EntrenadorBase):
    pass

class EntrenadorUpdate(BaseModel):
    anios_experiencia: Optional[int] = Field(None, ge=0)
    is_pasante: Optional[bool] = None


class UserForEntrenador(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class EntrenadorRead(EntrenadorBase):
    id: int
    user_id: int
    user: Optional[UserForEntrenador] = None
    
    model_config = ConfigDict(from_attributes=True)
