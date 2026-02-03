from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import date
from uuid import UUID
from app.modules.auth.domain.enums import SexoEnum, TipoIdentificacionEnum

# Base de datos personales (usado en creación)
class PasanteCreate(BaseModel):
    # Auth User
    email: EmailStr
    password: str
    
    # User Profile
    username: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    tipo_identificacion: TipoIdentificacionEnum
    identificacion: str
    fecha_nacimiento: date
    sexo: SexoEnum
    
    # Pasante specific
    especialidad: str
    fecha_inicio: date
    institucion_origen: Optional[str] = None

    @field_validator('email')
    @classmethod
    def normalize_email(cls, v: str):
        return v.strip().lower()

class PasanteUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    especialidad: Optional[str] = None
    institucion_origen: Optional[str] = None
    estado: Optional[bool] = None

class PasanteRead(BaseModel):
    id: int
    external_id: UUID
    user_id: int
    
    # Profile data (aggregated from User)
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str] = None # Will be populated from user.email
    identificacion: str
    phone: Optional[str]
    
    # Pasante data
    especialidad: str
    fecha_inicio: date
    institucion_origen: Optional[str]
    estado: bool
    
    class Config:
        from_attributes = True
