"""Esquemas Pydantic para Atleta."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from typing import Optional
from datetime import datetime


class UserInfo(BaseModel):
    """Información del usuario asociado al atleta."""
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    cedula: Optional[str] = None

    class Config:
        from_attributes = True


class AtletaBase(BaseModel):
    """Base schema para Atleta."""
    anios_experiencia: int = Field(..., ge=0, le=100, description="Años de experiencia (0-100)")
    foto_perfil: Optional[str] = Field(None, description="URL de la foto de perfil")


class AtletaCreate(AtletaBase):
    """Schema para crear Atleta."""
    pass


class AtletaUpdate(BaseModel):
    """Schema para actualizar Atleta."""
    anios_experiencia: Optional[int] = Field(None, ge=0, le=100)
    foto_perfil: Optional[str] = None


class AtletaRead(AtletaBase):
    """Schema para leer Atleta."""
    id: int
    external_id: UUID
    user_id: int
    user: UserInfo
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True


class AtletaDetail(AtletaRead):
    """Schema detallado de Atleta."""
    pass
