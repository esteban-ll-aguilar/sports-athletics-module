from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
import re
from datetime import date
from uuid import UUID
from typing import Optional
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

    phone: Optional[str] = Field(default=None, max_length=128, min_length=10)
    direccion: Optional[str] = Field(default=None, max_length=128, min_length=10)

    fecha_nacimiento: Optional[date] = None  
    sexo: Optional[SexoEnum] = SexoEnum.M     

    role: RoleEnum = Field(default=RoleEnum.ATLETA)

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

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: RoleEnum) -> RoleEnum:
        """Valida que el rol sea válido."""
        if v not in [RoleEnum.REPRESENTANTE, RoleEnum.ATLETA]:
            raise ValueError('El rol debe ser REPRESENTANTE o ATLETA')
        return v
    
    @field_validator('identificacion')
    @classmethod
    def validate_identification(cls, v: str, info) -> str:
        """Valida la cédula ecuatoriana."""
        if info.data.get('tipo_identificacion') == TipoIdentificacionEnum.CEDULA:
            if len(v) != 10 or not v.isdigit():
                raise ValueError('La cédula debe tener 10 dígitos numéricos')
            
            # Algoritmo de validación de cédula ecuatoriana
            import math
            try:
                # Primeros 2 dígitos: Provincia (0-24)
                provincia = int(v[0:2])
                if provincia < 0 or provincia > 24:
                     raise ValueError('Cédula inválida (código de provincia incorrecto)')
                
                # Tercer dígito: Menor a 6 (personas naturales)
                tercer_digito = int(v[2])
                if tercer_digito >= 6:
                     # Podría ser RUC o jurídica, pero aquí validamos Cédula natural
                     # Si se aceptan RUCs, la lógica cambia. Asumimos solo Cédula personal por ahora.
                     pass 

                multiplicador = [2, 1, 2, 1, 2, 1, 2, 1, 2]
                ced_array = [int(c) for c in v[0:9]]
                ultimo_digito = int(v[9])
                resultado = []
                
                for i, j in zip(ced_array, multiplicador):
                    producto = i * j
                    if producto < 10:
                        resultado.append(producto)
                    else:
                        resultado.append(producto - 9)
                
                suma = sum(resultado)
                digito_verificador_calculado = int(math.ceil(suma / 10.0) * 10) - suma
                
                if ultimo_digito != digito_verificador_calculado:
                    raise ValueError('Cédula inválida (dígito verificador incorrecto)')
                    
            except ValueError as e:
                raise e
            except Exception:
                raise ValueError('Error procesando validación de cédula')
                
        return v


class UserUpdateRequest(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None

    tipo_identificacion: TipoIdentificacionEnum | None = None
    tipo_estamento: TipoEstamentoEnum | None = None
    sexo: SexoEnum | None = None

    fecha_nacimiento: date | None = None
    phone: str | None = None
    direccion: str | None = None
    profile_image: str | None = None


class UserCreateAdmin(UserCreate):
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return v  # 🔓 sin validación


class UserRead(BaseModel):
    external_id: UUID = Field(serialization_alias="id")  # UUID se convierte automáticamente a string en JSON
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr
    is_active: bool
    role: RoleEnum | None = None
    profile_image: str | None = None
    tipo_identificacion: TipoIdentificacionEnum | None = None
    identificacion: str | None = None
    tipo_estamento: TipoEstamentoEnum | None = None
    phone: str | None = None
    direccion: str | None = None
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[SexoEnum] = None

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


class AdminUserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    profile_image: Optional[str] = None
