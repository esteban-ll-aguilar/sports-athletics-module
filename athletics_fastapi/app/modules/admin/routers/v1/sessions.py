from fastapi import APIRouter, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.modules.admin.domain.schemas import (
    MessageResponse,
    SessionsListResponse, SessionInfo, RevokeSessionRequest,
)
from app.modules.auth.dependencies import (
    get_sessions_repo, get_jwt_manager, 
)
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.core.jwt.jwt import JWTManager, get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.core.logging.logger import logger
from app.modules.modules import APP_TAGS_V1

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_sessions_router_v1 = APIRouter()


# ============================================
# Gestión de Sesiones
# ============================================

@auth_sessions_router_v1.get("/", response_model=SessionsListResponse)
async def get_my_sessions(
    current_user: AuthUserModel = Depends(get_current_user),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo)
):
    """
    Obtiene todas las sesiones activas del usuario autenticado.
    Útil para que el usuario vea desde dónde está conectado.
    """
    sessions = await sessions_repo.get_active_sessions_by_user(current_user.id)
    
    sessions_info = [
        SessionInfo(
            id=str(session.id),
            created_at=session.created_at.isoformat(),
            expires_at=session.expires_at.isoformat() if session.expires_at else None,
            status=session.status
        )
        for session in sessions
    ]
    
    logger.info(f"Usuario {current_user.email} consultó sus sesiones activas ({len(sessions_info)})")
    return SessionsListResponse(sessions=sessions_info, total=len(sessions_info))


@auth_sessions_router_v1.post("/revoke", response_model=MessageResponse)
async def revoke_session(
    data: RevokeSessionRequest,
    current_user: AuthUserModel = Depends(get_current_user),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Revoca una sesión específica del usuario.
    Útil para cerrar sesión remota desde otro dispositivo.
    """
    # Verificar que la sesión pertenece al usuario
    sessions = await sessions_repo.get_active_sessions_by_user(current_user.id)
    session_ids = [str(s.id) for s in sessions]
    
    if data.session_id not in session_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sesión no encontrada o ya revocada"
        )
    
    # Buscar la sesión para obtener sus JTIs
    session_to_revoke = next((s for s in sessions if str(s.id) == data.session_id), None)
    
    if session_to_revoke:
        # Revocar en Redis
        try:
            # Calcular tiempo restante de expiración
            exp_timestamp = int(session_to_revoke.expires_at.timestamp())
            await jwtm.revoke_until(session_to_revoke.access_token, exp_timestamp)
            await jwtm.revoke_until(session_to_revoke.refresh_token, exp_timestamp)
        except Exception as e:
            logger.error(f"Error revocando tokens en Redis: {e}")
        
        # Revocar en BD
        await sessions_repo.revoke_session_by_refresh_jti(session_to_revoke.refresh_token)
        
        logger.info(f"Usuario {current_user.email} revocó sesión {data.session_id}")
        return MessageResponse(message="Sesión revocada exitosamente")
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Error al revocar la sesión"
    )


@auth_sessions_router_v1.post("/revoke-all", response_model=MessageResponse)
async def revoke_all_sessions(
    current_user: AuthUserModel = Depends(get_current_user),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Revoca TODAS las sesiones del usuario excepto la actual.
    Útil si el usuario sospecha que su cuenta fue comprometida.
    """
    sessions = await sessions_repo.get_active_sessions_by_user(current_user.id)
    
    # Revocar todas en Redis y BD
    for session in sessions:
        try:
            exp_timestamp = int(session.expires_at.timestamp())
            await jwtm.revoke_until(session.access_token, exp_timestamp)
            await jwtm.revoke_until(session.refresh_token, exp_timestamp)
        except Exception as e:
            logger.error(f"Error revocando token en Redis: {e}")
    
    # Revocar todas en BD
    count = await sessions_repo.revoke_all_user_sessions(current_user.id)
    
    logger.warning(f"Usuario {current_user.email} revocó TODAS sus sesiones ({count})")
    return MessageResponse(message=f"Se revocaron {count} sesiones exitosamente")

