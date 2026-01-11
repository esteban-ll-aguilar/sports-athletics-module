
from pydantic import BaseModel, ConfigDict
# ============================================
# Schemas para gestión de sesiones
# ============================================

class SessionInfo(BaseModel):
    """Información de una sesión activa"""
    id: str
    created_at: str
    expires_at: str
    status: bool
    
    model_config = ConfigDict(from_attributes=True)

class SessionsListResponse(BaseModel):
    """Lista de sesiones activas del usuario"""
    sessions: list[SessionInfo]
    total: int

class RevokeSessionRequest(BaseModel):
    """Request para revocar una sesión específica"""
    session_id: str
