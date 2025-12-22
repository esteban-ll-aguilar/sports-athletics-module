from pydantic import BaseModel, EmailStr, Field
# ============================================
# Schemas para verificación de email
# ============================================

class EmailVerificationRequest(BaseModel):
    """Request para verificar email con código"""
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^[0-9]{6}$")

class ResendVerificationRequest(BaseModel):
    """Request para reenviar código de verificación"""
    email: EmailStr

