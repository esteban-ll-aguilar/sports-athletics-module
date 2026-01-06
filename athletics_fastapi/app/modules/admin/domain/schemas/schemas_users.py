from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import date

from app.modules.auth.domain.enums import (
    TipoEstamentoEnum,
    TipoIdentificacionEnum,
    SexoEnum,
    RoleEnum,
)

from .schemas_auth import UserRead


class UsersPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: List[UserRead]


class UserGet(BaseModel):
    external_id: UUID


class UserProfile(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None

    tipo_identificacion: Optional[TipoIdentificacionEnum] = None
    identificacion: Optional[str] = None
    tipo_estamento: Optional[TipoEstamentoEnum] = None
    sexo: Optional[SexoEnum] = None
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None

    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)
