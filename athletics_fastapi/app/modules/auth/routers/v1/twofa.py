from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.modules.auth.domain.schemas import (
    TokenPair,  MessageResponse,
    Enable2FAResponse, Verify2FARequest, Disable2FARequest, Login2FARequest, LoginBackupCodeRequest
)
from app.api.schemas.api_schemas import APIResponse
from app.modules.auth.dependencies import (
    get_users_repo, get_sessions_repo, get_jwt_manager, 
    get_password_hasher, get_two_factor_service
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.core.jwt.jwt import JWTManager, PasswordHasher, get_current_user
from app.modules.auth.services.two_factor_service import TwoFactorService
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.core.logging.logger import logger
from app.core.cache.redis import _redis
from datetime import datetime, timezone
from app.modules.modules import APP_TAGS_V1

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_twofa_router_v1 = APIRouter()

# ============================================
# Two-Factor Authentication (2FA)
# ============================================

@auth_twofa_router_v1.post("/enable", response_model=APIResponse[Enable2FAResponse])
async def enable_2fa(
    current_user: AuthUserModel = Depends(get_current_user),
    twofa_service: TwoFactorService = Depends(get_two_factor_service),
    repo: AuthUsersRepository = Depends(get_users_repo)
):
    """
    Habilita 2FA para el usuario autenticado.
    Retorna el QR code y códigos de respaldo.
    El usuario debe escanear el QR con su app y verificar con un código.
    """
    if current_user.two_factor_enabled:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="2FA ya está habilitado",
                data=None
            ).model_dump()
        )
    
    # Generar secret
    secret = twofa_service.generate_secret()
    
    # Generar QR code
    qr_code = twofa_service.generate_qr_code(secret, current_user.email)
    
    # Generar códigos de respaldo
    backup_codes = twofa_service.get_backup_codes()
    
    # Hashear y guardar códigos de respaldo
    hashed_backup_codes = twofa_service.hash_backup_codes(backup_codes)
    
    # Guardar secret y códigos hasheados en el usuario (pero no activar aún)
    current_user.totp_secret = secret
    current_user.totp_backup_codes = hashed_backup_codes
    await repo.db.commit()
    
    logger.info(f"2FA setup iniciado para usuario: {current_user.email}")
    
    return APIResponse(
        success=True,
        message="Configuración iniciada correctamente",
        data=Enable2FAResponse(
            secret=secret,
            qr_code=qr_code,
            backup_codes=backup_codes,
            message="Guarda estos códigos de respaldo en un lugar seguro. Escanea el QR y verifica con /verify"
        )
    )


@auth_twofa_router_v1.post("/verify", response_model=APIResponse[MessageResponse])
async def verify_and_activate_2fa(
    data: Verify2FARequest,
    current_user: AuthUserModel = Depends(get_current_user),
    twofa_service: TwoFactorService = Depends(get_two_factor_service),
    repo: AuthUsersRepository = Depends(get_users_repo)
):
    """
    Verifica el código TOTP y activa 2FA.
    Este es el último paso después de /enable.
    """
    if current_user.two_factor_enabled:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="2FA ya está activo",
                data=None
            ).model_dump()
        )
    
    if not current_user.totp_secret:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Primero debes iniciar el proceso con /enable",
                data=None
            ).model_dump()
        )
    
    # Verificar código
    is_valid = twofa_service.verify_totp_code(current_user.totp_secret, data.code)
    
    if not is_valid:
        logger.warning(f"Intento fallido de verificación 2FA para: {current_user.email}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Código inválido",
                data=None
            ).model_dump()
        )
    
    # Activar 2FA
    current_user.two_factor_enabled = True
    await repo.db.commit()
    
    logger.info(f"2FA activado exitosamente para usuario: {current_user.email}")
    
    return APIResponse(
        success=True,
        message="2FA activado exitosamente. Ahora necesitarás un código en cada login.",
        data=MessageResponse(message="2FA activado exitosamente. Ahora necesitarás un código en cada login.")
    )


@auth_twofa_router_v1.post("/disable", response_model=APIResponse[MessageResponse])
async def disable_2fa(
    data: Disable2FARequest,
    current_user: AuthUserModel = Depends(get_current_user),
    twofa_service: TwoFactorService = Depends(get_two_factor_service),
    hasher: PasswordHasher = Depends(get_password_hasher),
    repo: AuthUsersRepository = Depends(get_users_repo)
):
    """
    Deshabilita 2FA.
    Requiere contraseña y código TOTP válido para mayor seguridad.
    """
    if not current_user.two_factor_enabled:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="2FA no está habilitado",
                data=None
            ).model_dump()
        )
    
    # Verificar contraseña
    if not hasher.verify(data.password, current_user.hashed_password):
        logger.warning(f"Intento de deshabilitar 2FA con contraseña incorrecta: {current_user.email}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Contraseña incorrecta",
                data=None
            ).model_dump()
        )
    
    # Verificar código TOTP
    is_valid = twofa_service.verify_totp_code(current_user.totp_secret, data.code)
    
    if not is_valid:
        logger.warning(f"Intento de deshabilitar 2FA con código inválido: {current_user.email}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=APIResponse(
                success=False,
                message="Código TOTP inválido",
                data=None
            ).model_dump()
        )
    
    # Deshabilitar 2FA y limpiar datos
    current_user.two_factor_enabled = False
    current_user.totp_secret = None
    current_user.totp_backup_codes = None
    await repo.db.commit()
    
    logger.warning(f"2FA deshabilitado para usuario: {current_user.email}")
    
    return APIResponse(
        success=True,
        message="2FA deshabilitado exitosamente",
        data=MessageResponse(message="2FA deshabilitado exitosamente")
    )


@auth_twofa_router_v1.post("/login", response_model=APIResponse[TokenPair])
@limiter.limit("10/minute")  # Limitar intentos de 2FA
async def login_with_2fa(
    request: Request,
    data: Login2FARequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    twofa_service: TwoFactorService = Depends(get_two_factor_service),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Segundo paso del login cuando el usuario tiene 2FA habilitado.
    Requiere el token temporal del primer paso y el código TOTP.
    Protegido contra timing attacks y con límite de intentos por IP.
    """
    # Verificar token temporal
    try:
        payload = jwtm.decode(data.temp_token)
        user_id = payload.get("sub")
        
        if not user_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content=APIResponse(
                    success=False,
                    message="Token inválido",
                    data=None
                ).model_dump()
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Token temporal inválido o expirado",
                data=None
            ).model_dump()
        )
    
    # Verificar intentos fallidos (protección adicional contra fuerza bruta)
    redis = _redis.get_client()
    attempts_key = f"2fa_attempts:{user_id}"
    attempts = await redis.incr(attempts_key)
    await redis.expire(attempts_key, 900)  # 15 minutos
    
    if attempts > 5:
        logger.warning(f"Demasiados intentos 2FA para user_id: {user_id}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=APIResponse(
                success=False,
                message="Demasiados intentos fallidos. Espera 15 minutos.",
                data=None
            ).model_dump()
        )
    
    # Obtener usuario
    user = await repo.get_by_id(int(user_id))
    
    # PROTECCIÓN CONTRA TIMING ATTACKS:
    # Siempre verificar código (incluso si el usuario no existe o email no coincide)
    # para mantener timing constante
    if not user or not user.is_active or user.email != data.email or not user.two_factor_enabled or not user.totp_secret:
        # Verificar código falso para mantener mismo timing
        twofa_service.verify_totp_code("FAKESECRETFORTIMINGATTACK1234", data.code)
        logger.warning(f"Intento de login 2FA con datos inválidos")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Credenciales inválidas",
                data=None
            ).model_dump()
        )
    
    # Verificar código TOTP real
    is_valid = twofa_service.verify_totp_code(user.totp_secret, data.code)
    
    if not is_valid:
        logger.warning(f"Intento de login 2FA fallido para: {user.email}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Código 2FA inválido",
                data=None
            ).model_dump()
        )
    
    # Login exitoso - limpiar contador de intentos
    await redis.delete(attempts_key)
    
    # Generar tokens finales
    access = jwtm.create_access_token(str(user.id), user.profile.role.name, user.email, user.profile.username)
    refresh = jwtm.create_refresh_token(str(user.id), user.profile.role.name, user.email, user.profile.username)
    
    # Decodificar para obtener JTIs y exp
    access_payload = jwtm.decode(access)
    refresh_payload = jwtm.decode(refresh)
    
    # Guardar en Redis
    await jwtm.store_refresh(refresh_payload["jti"], str(user.id), refresh_payload["exp"])
    
    # Verificar si ya existe una sesión activa para este usuario
    existing_session = await sessions_repo.get_latest_active_session(user.id)
    
    if existing_session:
        # Reutilizar sesión existente
        logger.info(f"Reutilizando sesión existente para 2FA login: {user.email}")
        await sessions_repo.update_session_tokens(
            session_id=existing_session.id,
            new_access_jti=access_payload["jti"],
            new_refresh_jti=refresh_payload["jti"],
            new_expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    else:
        # Crear nueva sesión
        logger.info(f"Creando nueva sesión para 2FA login: {user.email}")
        await sessions_repo.create_session(
            user_id=user.id,
            access_jti=access_payload["jti"],
            refresh_jti=refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    
    await repo.db.commit()
    
    logger.info(f"Login 2FA exitoso para usuario: {user.email}")
    return APIResponse(
        success=True,
        message="Login exitoso",
        data=TokenPair(access_token=access, refresh_token=refresh)
    )


@auth_twofa_router_v1.post("/login-backup", response_model=APIResponse[TokenPair])
@limiter.limit("5/minute")  # Límite más restrictivo para backup codes
async def login_with_backup_code(
    request: Request,
    data: LoginBackupCodeRequest,
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    twofa_service: TwoFactorService = Depends(get_two_factor_service),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Login con código de respaldo cuando el usuario no tiene acceso a su app 2FA.
    El código se consume (solo puede usarse una vez).
    """
    # Verificar token temporal
    try:
        payload = jwtm.decode(data.temp_token)
        user_id = payload.get("sub")
        if not user_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content=APIResponse(
                    success=False,
                    message="Token inválido",
                    data=None
                ).model_dump()
            )
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Token temporal inválido o expirado",
                data=None
            ).model_dump()
        )
    
    # Verificar intentos fallidos
    redis = _redis.get_client()
    attempts_key = f"backup_code_attempts:{user_id}"
    attempts = await redis.incr(attempts_key)
    await redis.expire(attempts_key, 1800)  # 30 minutos
    
    if attempts > 3:
        logger.warning(f"Demasiados intentos de backup code para user_id: {user_id}")
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content=APIResponse(
                success=False,
                message="Demasiados intentos fallidos. Espera 30 minutos.",
                data=None
            ).model_dump()
        )
    
    # Obtener usuario
    user = await repo.get_by_id(int(user_id))
    
    # PROTECCIÓN CONTRA TIMING ATTACKS
    if not user or not user.is_active or user.email != data.email or not user.two_factor_enabled or not user.totp_backup_codes:
        # Verificar código falso para mantener timing constante
        twofa_service.verify_backup_code('["fake"]', "XXXX-XXXX")
        logger.warning(f"Intento de login con backup code inválido")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Credenciales inválidas",
                data=None
            ).model_dump()
        )
    
    # Verificar backup code
    is_valid = twofa_service.verify_backup_code(user.totp_backup_codes, data.backup_code)
    
    if not is_valid:
        logger.warning(f"Backup code inválido para: {user.email}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=APIResponse(
                success=False,
                message="Código de respaldo inválido o ya usado",
                data=None
            ).model_dump()
        )
    
    # Login exitoso - eliminar código usado
    user.totp_backup_codes = twofa_service.remove_used_backup_code(user.totp_backup_codes, data.backup_code)
    await repo.db.commit()
    
    # Limpiar contador de intentos
    await redis.delete(attempts_key)
    
    # Generar tokens
    access = jwtm.create_access_token(str(user.id), user.profile.role.name, user.email, user.profile.username)
    refresh = jwtm.create_refresh_token(str(user.id), user.profile.role.name, user.email, user.profile.username)
    
    access_payload = jwtm.decode(access)
    refresh_payload = jwtm.decode(refresh)
    
    await jwtm.store_refresh(refresh_payload["jti"], str(user.id), refresh_payload["exp"])
    
    # Intentar reutilizar sesión existente en lugar de crear una nueva
    existing_session = await sessions_repo.get_latest_active_session(user.id)
    if existing_session:
        logger.info(f"Reutilizando sesión existente para usuario (backup code): {user.email}")
        await sessions_repo.update_session_tokens(
            session_id=existing_session.id,
            new_access_jti=access_payload["jti"],
            new_refresh_jti=refresh_payload["jti"],
            new_expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    else:
        logger.info(f"Creando nueva sesión para usuario (backup code): {user.email}")
        await sessions_repo.create_session(
            user_id=user.id,
            access_jti=access_payload["jti"],
            refresh_jti=refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    await repo.db.commit()
    
    logger.warning(f"Login con backup code exitoso para: {user.email} (código consumido)")
    return APIResponse(
        success=True,
        message="Login exitoso",
        data=TokenPair(access_token=access, refresh_token=refresh)
    )
