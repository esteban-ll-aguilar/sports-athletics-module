"""Esquemas Pydantic para Atleta."""
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime, date


# =========================
# Usuario asociado
# =========================
class UserInfo(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    cedula: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# =========================
# Base Atleta
# =========================
class AtletaBase(BaseModel):
    anios_experiencia: int = Field(..., ge=0, le=100)
    fecha_nacimiento: date
    foto_perfil: Optional[str] = None


# =========================
# Crear
# =========================
class AtletaCreate(AtletaBase):
    pass


# =========================
# Actualizar
# =========================
class AtletaUpdate(BaseModel):
    anios_experiencia: Optional[int] = Field(None, ge=0, le=100)
    fecha_nacimiento: Optional[date] = None
    foto_perfil: Optional[str] = None


# =========================
# Leer
# =========================
class AtletaRead(AtletaBase):
    id: int
    external_id: UUID
    user_id: int
    user: UserInfo
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# =========================
# Detalle (igual al read)
# =========================
class AtletaDetail(AtletaRead):
    pass
