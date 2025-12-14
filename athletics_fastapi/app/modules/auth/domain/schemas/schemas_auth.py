from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from uuid import UUID
from app.modules.auth.domain.enums.role_enum import RoleEnum
from datetime import date


class UserCreate(BaseModel):
    username: str = Field(min_length=4, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: RoleEnum = Field(default=RoleEnum.ATLETA, description="Rol del usuario en el sistema")
    
    # Campos opcionales del perfil
    nombre_completo: str | None = Field(None, min_length=2, max_length=100, description="Nombre completo del usuario")
    cedula: str | None = Field(None, min_length=6, max_length=20, description="Número de cédula de identidad")
    fecha_nacimiento: date | None = Field(None, description="Fecha de nacimiento")
    sexo: str | None = Field(None, pattern="^(M|F|Otro)$", description="Sexo: M, F u Otro")
    telefono: str | None = Field(None, min_length=7, max_length=17, description="Número de teléfono")
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Valida que la contraseña sea fuerte."""
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una letra mayúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una letra minúscula')
        if not re.search(r'[0-9]', v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\\/;\'`~]', v):
            raise ValueError('La contraseña debe contener al menos un carácter especial')
        return v
    
    @field_validator('cedula')
    @classmethod
    def validate_cedula(cls, v: str | None) -> str | None:
        """Valida que la cédula solo contenga números y guiones."""
        if v is None:
            return v
        if not re.match(r'^[0-9\-]+$', v):
            raise ValueError('La cédula solo debe contener números y guiones')
        return v
    
    @field_validator('telefono')
    @classmethod
    def validate_telefono(cls, v: str | None) -> str | None:
        """Valida formato de teléfono."""
        if v is None:
            return v
        # Permitir números, espacios, guiones, paréntesis y el signo +
        if not re.match(r'^[\d\s\-\+\(\)]+$', v):
            raise ValueError('El teléfono contiene caracteres inválidos')
        return v

class UserRead(BaseModel):
    external_id: UUID = Field(serialization_alias="id")  # UUID se convierte automáticamente a string en JSON
    username: str | None = Field(None, serialization_alias="username")
    email: EmailStr
    is_active: bool
    role: RoleEnum | None = None
    nombre: str | None = None
    created_at: str | None = None
    
    class Config:
        from_attributes = True  # Permite crear desde ORM models
    
    def model_post_init(self, __context) -> None:
        """Mapea nombre a username después de la validación."""
        if self.nombre and not self.username:
            self.username = self.nombre

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

