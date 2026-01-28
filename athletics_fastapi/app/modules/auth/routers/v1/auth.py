from fastapi import APIRouter, Depends, status, Request, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Union
from datetime import datetime, timezone

from app.modules.auth.domain.schemas import (
    UserCreateSchema,
    UserResponseSchema,
    TokenPair,
    RefreshRequest,
    TwoFactorRequired,
    LoginSchema
)

from app.modules.auth.dependencies import (
    get_users_repo,
    get_sessions_repo,
    get_jwt_manager,
    get_password_hasher,
    get_email_service,
    get_email_verification_service,
)

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.core.jwt.jwt import JWTManager, PasswordHasher, oauth2_scheme
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.email_verification_service import EmailVerificationService
from app.core.logging.logger import logger
from app.api.schemas.api_schemas import APIResponse

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_router_v1 = APIRouter()


# ======================================================
# REGISTER
# ======================================================

@auth_router_v1.post(
    "/register",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_201_CREATED,
)
@limiter.limit("10/minute")
async def register(
    request: Request,
    data: UserCreateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    email_service: AuthEmailService = Depends(get_email_service),
    verification_service: EmailVerificationService = Depends(get_email_verification_service),
):
    """
    Registra un nuevo usuario (INACTIVO hasta verificación de email).
    """

    if await repo.get_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ya registrado",
        )
    
    try:
        password_hash = hasher.hash(data.password)
        user = await repo.create(password_hash=password_hash, user_data=data)
        
        # Enviar código de verificación
        code = verification_service.generate_verification_code()
        await verification_service.store_verification_code(data.email, code)

        try:
            email_service.send_email_verification_code(data.email, code)
        except Exception as e:
            logger.error(f"Error enviando email de verificación: {e}")

        return APIResponse(
            success=True,
            message="Usuario registrado exitosamente. Por favor verifica tu email.",
            data=UserResponseSchema.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )


# ======================================================
# LOGIN
# ======================================================

@auth_router_v1.post(
    "/login",
    response_model=APIResponse[Union[TokenPair, TwoFactorRequired]],
)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    data: LoginSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    # Ya no capturamos todas las excepciones para permitir que HTTPException fluya
    user = await repo.get_by_email(data.username)

    if not user or not hasher.verify(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo, por favor verifica tu email",
        )

    if user.two_factor_enabled:
        temp_token = jwtm.create_access_token(
            str(user.id),
            user.profile.role.name,
            user.email,
            user.profile.username,
        )
        return APIResponse(
            success=True,
            message="Se requiere autenticación de dos factores",
            data=TwoFactorRequired(
                temp_token=temp_token,
                message="2FA requerido",
            )
        )

    access = jwtm.create_access_token(
        str(user.id),
        user.profile.role.name,
        user.email,
        user.profile.username,
    )
    refresh = jwtm.create_refresh_token(
        str(user.id),
        user.profile.role.name,
        user.email,
        user.profile.username,
    )

    access_payload = jwtm.decode(access)
    refresh_payload = jwtm.decode(refresh)

    await jwtm.store_refresh(
        refresh_payload["jti"],
        str(user.id),
        refresh_payload["exp"],
    )

    await sessions_repo.create_or_update_session(
        user_id=user.id,
        access_jti=access_payload["jti"],
        refresh_jti=refresh_payload["jti"],
        expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc),
    )

    # Set Refresh Token in HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=False, # TODO: Set to False for localhost development
        samesite="lax", # or 'strict'
        max_age=7 * 24 * 60 * 60 # 7 days
    )

    return APIResponse(
        success=True,
        message="Inicio de sesión exitoso",
        data=TokenPair(
            access_token=access,
            refresh_token=refresh, # We keep returning it for non-browser clients, optional
        )
    )


# ======================================================
# REFRESH
# ======================================================

@auth_router_v1.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh_token(
    request: Request,
    response: Response,
    body: RefreshRequest,
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    try:
        logger.info(f"Refresh attempt. Cookies: {request.cookies.keys()}")
        # Get refresh token from cookie if not in body
        token_to_refresh = body.refresh_token
        if not token_to_refresh:
            token_to_refresh = request.cookies.get("refresh_token")
        
        if not token_to_refresh:
             raise HTTPException(status_code=400, detail="Refresh token no proporcionado")

        try:
            payload = jwtm.decode(token_to_refresh)
        except Exception:
             raise HTTPException(status_code=401, detail="Token inválido o expirado")

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Token inválido")

        sub = payload["sub"]
        jti = payload["jti"]

        if await jwtm.consume_refresh(jti) != sub:
            raise HTTPException(status_code=401, detail="Refresh inválido")

        access = jwtm.create_access_token(
            sub, payload["role"], payload["email"], payload["name"]
        )
        refresh = jwtm.create_refresh_token(
            sub, payload["role"], payload["email"], payload["name"]
        )

        access_payload = jwtm.decode(access)
        refresh_payload = jwtm.decode(refresh)

        await jwtm.store_refresh(
            refresh_payload["jti"],
            refresh_payload["sub"],
            refresh_payload["exp"],
        )

        await sessions_repo.update_session_after_refresh(
            old_refresh_jti=jti,
            new_access_jti=access_payload["jti"],
            new_refresh_jti=refresh_payload["jti"],
            new_expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc),
        )

        # Update cookie with new refresh token
        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False, # TODO: False for dev
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        return APIResponse(
            success=True,
            message="Token refrescado exitosamente",
            data=TokenPair(
                access_token=access,
                refresh_token=refresh,
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al refrescar el token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )


# ======================================================
# LOGOUT
# ======================================================

@auth_router_v1.post("/logout", response_model=APIResponse)
async def logout(
    request: Request,
    response: Response,
    body: RefreshRequest = None,  # Opcional, para invalidar refresh
    jwtm: JWTManager = Depends(get_jwt_manager),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
):
    """
    Cierra sesión. Opcionalmente invalida el refresh token provisto.
    """
    try:
        cookie_refresh = request.cookies.get("refresh_token")
        token_to_revoke = (body and body.refresh_token) or cookie_refresh
        
        if token_to_revoke:
            try:
                payload = jwtm.decode(token_to_revoke)
                jti = payload.get("jti")
                if jti:
                    # Revocar la sesión en base de datos
                    await sessions_repo.revoke_session_by_refresh_jti(jti)
            except Exception:
                pass # Ignorar errores de token inválido en logout, queremos borrar cookie igual
        
        # Eliminar cookie explícitamente
        response.delete_cookie(
            key="refresh_token", 
            httponly=True, 
            secure=False, # Debe coincidir con como se seteo
            samesite="lax"
        )
        
        return APIResponse(
            success=True,
            message="Sesión cerrada exitosamente"
        )
    except Exception as e:
        logger.error(f"Error en logout: {e}")
        # Clear cookie force
        response.delete_cookie(key="refresh_token")

        return APIResponse(
            success=True, 
            message="Sesión cerrada (con advertencias)"
        )

