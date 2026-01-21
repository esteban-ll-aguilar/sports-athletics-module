from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from uuid import UUID
import datetime
import re

from app.modules.atleta.domain.schemas.atleta_schema import AtletaCreate, AtletaUpdate
from app.modules.entrenador.domain.schemas.entrenador_schema import EntrenadorCreate
from app.modules.auth.domain.enums import (
    TipoEstamentoEnum,
    TipoIdentificacionEnum,
    RoleEnum,
    SexoEnum
)

# ======================================================
# UTILS
# ======================================================

def validar_cedula_ecuador(cedula: str) -> bool:
    """Valida cédula ecuatoriana con algoritmo módulo 10."""
    if not cedula.isdigit() or len(cedula) != 10:
        return False
        
    provincia = int(cedula[:2])
    if provincia < 1 or provincia > 24:
        return False
        
    tercer_digito = int(cedula[2])
    if tercer_digito >= 6:
        return False
        
    # Coeficientes: 2, 1, 2, 1, 2, 1, 2, 1, 2
    coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = 0
    
    for i in range(9):
        valor = int(cedula[i]) * coeficientes[i]
        if valor >= 10:
            valor -= 9
        suma += valor
        
    digito_verificador = int(cedula[9])
    residuo = suma % 10
    resultado = 10 - residuo if residuo != 0 else 0
    
    return resultado == digito_verificador

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
    
    @field_validator('identificacion')
    @classmethod
    def validate_identificacion(cls, v: str, info):
        # Acceder a tipo_identificacion desde info.data si es posible, 
        # pero para validadores simples asumimos validación de cédula si parece serlo
        # O idealmente validar si el tipo es CEDULA.
        # Limitacion: en Pydantic v2 field_validator el contexto de otros campos está en info.data
        if info.data.get('tipo_identificacion') == TipoIdentificacionEnum.CEDULA:
             if not validar_cedula_ecuador(v):
                 raise ValueError('Cédula inválida')
        return v
        
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]):
        if v and len(v) < 7:
            raise ValueError('Número de teléfono inválido')
        return v

# ======================================================
# CREATE
# ======================================================

class UserCreateSchema(UserBaseSchema):
    email: str # Should be EmailStr but str for now to match other patterns if any
    password: str
    
    # Optional role-specific data
    atleta_data: Optional[AtletaCreate] = None
    entrenador_data: Optional[EntrenadorCreate] = None
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not re.search(r"[A-Z]", v):
            raise ValueError('La contraseña debe tener al menos una mayúscula')
        if not re.search(r"\d", v):
            raise ValueError('La contraseña debe tener al menos un número')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('La contraseña debe tener al menos un carácter especial')
        return v
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v: RoleEnum):
        if v == RoleEnum.ADMINISTRADOR:
             # Simple check logic, usually restricted at endpoint/service level but good as backup
             # For public registration, likely shouldn't allow creating ADMIN directly
             pass 
        return v

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
