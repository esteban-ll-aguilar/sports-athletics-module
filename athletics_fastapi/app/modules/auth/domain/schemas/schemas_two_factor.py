from pydantic import BaseModel, EmailStr, Field
# ============================================
# Schemas para 2FA (Two-Factor Authentication)
# ============================================

class Enable2FAResponse(BaseModel):
    """Response al habilitar 2FA con QR code"""
    secret: str
    qr_code: str  # Base64 image
    backup_codes: list[str]
    message: str

class Verify2FARequest(BaseModel):
    """Request para verificar código TOTP"""
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")

class Disable2FARequest(BaseModel):
    """Request para deshabilitar 2FA"""
    password: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")

class Login2FARequest(BaseModel):
    """Request para segundo paso del login con 2FA"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")
    temp_token: str  # Token temporal del primer paso

class TwoFactorRequired(BaseModel):
    """Response cuando se requiere 2FA en el login"""
    requires_2fa: bool = True
    temp_token: str
    message: str = "2FA requerido. Usa el endpoint /2fa/login"

class LoginBackupCodeRequest(BaseModel):
    """Request para login con código de respaldo"""
    email: EmailStr
    backup_code: str = Field(..., pattern=r"^[A-Z0-9]{4}-[A-Z0-9]{4}$")
    temp_token: str