from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
import datetime

from app.modules.atleta.domain.schemas.atleta_schema import AtletaCreate, AtletaUpdate
from app.modules.entrenador.domain.schemas.entrenador_schema import EntrenadorCreate
from app.modules.auth.domain.enums import (
    TipoEstamentoEnum,
    TipoIdentificacionEnum,
    RoleEnum,
    SexoEnum
)

# ======================================================
# BASE
# ======================================================

class UserBaseSchema(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=17)
    profile_image: Optional[str] = None
    direccion: Optional[str] = None

    tipo_identificacion: TipoIdentificacionEnum
    identificacion: str = Field(..., min_length=5, max_length=20)

    tipo_estamento: TipoEstamentoEnum

    fecha_nacimiento: Optional[datetime.date] = None
    sexo: Optional[SexoEnum] = None
    role: RoleEnum = RoleEnum.ATLETA

# ======================================================
# CREATE
# ======================================================

class UserCreateSchema(UserBaseSchema):
    email: str # Should be EmailStr but str for now to match other patterns if any
    password: str
    
    # Optional role-specific data
    atleta_data: Optional[AtletaCreate] = None
    entrenador_data: Optional[EntrenadorCreate] = None

# ======================================================
# UPDATE
# ======================================================

class UserUpdateSchema(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    direccion: Optional[str] = None
    tipo_identificacion: Optional[TipoIdentificacionEnum] = None
    identificacion: Optional[str] = None
    tipo_estamento: Optional[TipoEstamentoEnum] = None
    fecha_nacimiento: Optional[datetime.date] = None
    sexo: Optional[SexoEnum] = None
    is_active: Optional[bool] = None
    role: Optional[RoleEnum] = None
    
    atleta_data: Optional['AtletaUpdate'] = None

# ======================================================
# RESPONSE
# ======================================================

class UserResponseSchema(UserBaseSchema):
    id: int
    external_id: UUID
    auth_user_id: int
    email: Optional[str] = None
    is_active: Optional[bool] = None
    two_factor_enabled: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

# ======================================================
# SIMPLE
# ======================================================

class UserSimpleSchema(BaseModel):
    external_id: UUID
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)

# ======================================================
# RELATIONS (MINIMAL)
# ======================================================

class AtletaSimpleSchema(BaseModel):
    id: Optional[int] = None
    external_id: Optional[UUID] = None
    categoria: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EntrenadorSimpleSchema(BaseModel):
    id: Optional[int] = None
    external_id: Optional[UUID] = None
    especialidad: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RepresentanteSimpleSchema(BaseModel):
    id: Optional[int] = None
    external_id: Optional[UUID] = None
    parentesco: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ======================================================
# USER WITH RELATIONS
# ======================================================

class UserWithRelationsSchema(UserResponseSchema):
    atleta: Optional[AtletaSimpleSchema] = None
    entrenador: Optional[EntrenadorSimpleSchema] = None
    representante: Optional[RepresentanteSimpleSchema] = None

# ======================================================
# AUTH CONTEXT
# ======================================================

class UserAuthSchema(BaseModel):
    id: int
    external_id: UUID
    role: RoleEnum

    model_config = ConfigDict(from_attributes=True)
