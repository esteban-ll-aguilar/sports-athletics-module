from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from uuid import UUID


class UserCreate(BaseModel):
    username: str = Field(min_length=4, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    
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

class UserRead(BaseModel):
    external_id: UUID = Field(serialization_alias="id")  # UUID se convierte automáticamente a string en JSON
    email: EmailStr
    is_active: bool
    
    class Config:
        from_attributes = True  # Permite crear desde ORM models

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


