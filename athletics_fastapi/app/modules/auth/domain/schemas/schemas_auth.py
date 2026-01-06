from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from datetime import date
from uuid import UUID
from app.modules.auth.domain.enums import RoleEnum, SexoEnum,TipoEstamentoEnum, TipoIdentificacionEnum


from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from datetime import date
from uuid import UUID
from app.modules.auth.domain.enums import RoleEnum, SexoEnum, TipoEstamentoEnum, TipoIdentificacionEnum

class UserCreate(BaseModel):
    username: str = Field(min_length=4, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    first_name: str = Field(min_length=2, max_length=50)
    last_name: str = Field(min_length=2, max_length=50)

    tipo_identificacion: TipoIdentificacionEnum = Field(default=TipoIdentificacionEnum.CEDULA)
    identificacion: str = Field(min_length=8, max_length=128)

    tipo_estamento: TipoEstamentoEnum = Field(default=TipoEstamentoEnum.EXTERNOS)

    phone: str = Field(min_length=8, max_length=128, default="")
    direccion: str = Field(min_length=8, max_length=128, default="")

    role: RoleEnum = Field(default=RoleEnum.ATLETA)



    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una letra mayúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra minúscula')
        if not re.search(r'[0-9]', v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\\/;\'`~]', v):
            raise ValueError('La contraseña debe contener al menos un carácter especial')
        return v

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: RoleEnum) -> RoleEnum:
        if v not in [RoleEnum.REPRESENTANTE, RoleEnum.ATLETA]:
            raise ValueError('El rol debe ser REPRESENTANTE o ATLETA')
        return v


class UserUpdateRequest(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    tipo_identificacion: TipoIdentificacionEnum 
    tipo_estamento: TipoEstamentoEnum
    fecha_nacimiento: date | None = None
    phone: str | None = None
    direccion: str | None = None
    sexo: SexoEnum
    profile_image: str | None = None
    

class UserCreateAdmin(UserCreate):
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return v  

class UserRead(BaseModel):
    external_id: UUID = Field(serialization_alias="id")  
    email: EmailStr
    is_active: bool
    role: RoleEnum | None = None
    username: str | None = None
    profile_image: str | None = None
    
    model_config = ConfigDict(from_attributes=True)

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetCodeValidation(BaseModel):
    """Schema para validar solo el código de reset"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[A-Z0-9]{6}$")

class PasswordResetConfirm(BaseModel):
    """Schema para confirmar el reset con código ya validado"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[A-Z0-9]{6}$")
    new_password: str = Field(..., min_length=8, max_length=128)

class PasswordResetComplete(BaseModel):
    """Schema para completar el reset después de validación"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[A-Z0-9]{6}$")
    new_password: str = Field(..., min_length=8, max_length=128)

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    def validate_passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")
        return self

class MessageResponse(BaseModel):
    message: str


