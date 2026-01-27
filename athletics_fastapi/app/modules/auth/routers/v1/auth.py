from fastapi import APIRouter, Depends, HTTPException, status, Request
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
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler
from app.utils.response_codes import ResponseCodes

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_router_v1 = APIRouter()


# ======================================================
# REGISTER
# ======================================================

@auth_router_v1.post(
    "/register",
    response_model=BaseResponse,
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
        return ResponseHandler.conflict_response(
            summary="Error de registro",
            message="Email ya registrado"
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

        return ResponseHandler.success_response(
            summary="Usuario registrado con exito",
            message="Usuario registrado correctamente. Por favor verifica tu email.",
            data=UserResponseSchema.model_validate(user).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al registrar usuario",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ======================================================
# LOGIN
# ======================================================

@auth_router_v1.post(
    "/login",
    response_model=BaseResponse,
)
@limiter.limit("5/minute")
async def login(
    request: Request,
    data: LoginSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    try:
        user = await repo.get_by_email(data.username)

        if not user or not hasher.verify(data.password, user.hashed_password):
            return ResponseHandler.unauthorized_response(
                message="Credenciales inválidas"
            )

        if not user.is_active:
            return ResponseHandler.unauthorized_response(
                message="Usuario inactivo, por favor verifica tu email"
            )

        if user.two_factor_enabled:
            temp_token = jwtm.create_access_token(
                str(user.id),
                user.profile.role.name,
                user.email,
                user.profile.username,
            )
            return ResponseHandler.success_response(
                summary="2FA Requerido",
                message="Se requiere autenticación de dos factores",
                data=TwoFactorRequired(
                    temp_token=temp_token,
                    message="2FA requerido",
                ).model_dump()
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

        return ResponseHandler.success_response(
            summary="Login exitoso",
            message="Inicio de sesión correcto",
            data=TokenPair(
                access_token=access,
                refresh_token=refresh,
            ).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error en inicio de sesión",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ======================================================
# REFRESH
# ======================================================

@auth_router_v1.post("/refresh", response_model=BaseResponse)
async def refresh_token(
    body: RefreshRequest,
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    try:
        payload = jwtm.decode(body.refresh_token)

        if payload.get("type") != "refresh":
             return ResponseHandler.error_response(
                summary="Token inválido",
                message="Token provisto no es de tipo refresh",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        sub = payload["sub"]
        jti = payload["jti"]

        if await jwtm.consume_refresh(jti) != sub:
             return ResponseHandler.unauthorized_response(
                message="Refresh token inválido o reutilizado"
            )

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

        await sessions_repo.update_session_access_token(
            old_refresh_jti=jti,
            new_access_jti=access_payload["jti"],
        )

        return ResponseHandler.success_response(
            summary="Token refrescado",
            message="Token refrescado exitosamente",
            data=TokenPair(
                access_token=access,
                refresh_token=refresh,
            ).model_dump()
        )
    except Exception as e:
         return ResponseHandler.error_response(
            summary="Error al refrescar token",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
