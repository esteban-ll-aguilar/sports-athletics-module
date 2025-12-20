from pydantic import BaseModel
from typing import List
from .schemas_auth import UserRead
from uuid import UUID
from app.modules.auth.domain.enums import TipoEstamentoEnum, TipoIdentificacionEnum, SexoEnum, RoleEnum
from datetime import date
class UsersPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: list[UserRead]

class UserGet(BaseModel):
    external_id: UUID


class UserProfile(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    phone: str

    tipo_identificacion: TipoIdentificacionEnum
    identificacion: str
    tipo_estamento: TipoEstamentoEnum
    sexo: SexoEnum
    fecha_nacimiento: date
    direccion: str
    role: RoleEnum
    
    class Config:
        from_attributes = True
    
    
