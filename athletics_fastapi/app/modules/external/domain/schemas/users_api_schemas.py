from pydantic import BaseModel, EmailStr, Field, field_validator
from app.modules.auth.domain.enums import TipoIdentificacionEnum, TipoEstamentoEnum


# ============================================
# CONFIGURACIÓN  REQUEST
# ============================================
class UserExternalCreateRequest(BaseModel):
    """
    Schema para crear un usuario
    """
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    type_identification: str = Field(TipoIdentificacionEnum, description="Tipo de identificación")
    identification: str = Field(min_length=2, max_length=50)
    type_stament: str = Field(TipoEstamentoEnum, description="Tipo de estamento")
    direction: str = Field(min_length=2, max_length=50)
    phono: str = Field(min_length=2, max_length=50)
    email: EmailStr = Field(min_length=2, max_length=50)
    password: str = Field(min_length=2, max_length=50)

    @field_validator("type_identification")
    def validate_type_identification(cls, v):
        if v not in TipoIdentificacionEnum.values():
            raise ValueError("Invalid type_identification")
        return v

    @field_validator("type_stament")
    def validate_type_stament(cls, v):
        if v not in TipoEstamentoEnum.values():
            raise ValueError("Invalid type_stament")
        return v

class UserExternalUpdateRequest(BaseModel):
    """
    Schema para actualizar un usuario
    """
    dni: str = Field(min_length=2, max_length=50)
    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)
    external: str = Field(min_length=0, max_length=50, default="")
    type_identification: str = Field(min_length=2, max_length=50)
    type_stament: str = Field(min_length=2, max_length=50)
    direction: str = Field(min_length=2, max_length=50)
    phono: str = Field(min_length=2, max_length=50)

    @field_validator("type_identification")
    def validate_type_identification(cls, v):
        if v not in TipoIdentificacionEnum.values():
            raise ValueError("Invalid type_identification")
        return v

    @field_validator("type_stament")
    def validate_type_stament(cls, v):
        if v not in TipoEstamentoEnum.values():
            raise ValueError("Invalid type_stament")
        return v

class UserExternalUpdateAccountRequest(BaseModel):
    """
    Schema para actualizar un usuario
    """
    dni: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=2, max_length=50)


    