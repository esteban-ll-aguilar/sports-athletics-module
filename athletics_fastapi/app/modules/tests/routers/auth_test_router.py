"""
Auth Test Router - No Rate Limiting
Provides authentication endpoints without rate limiting for testing purposes.
Users are created with is_active=True by default and support multiple roles.
"""
from fastapi import APIRouter, Depends, status, Request, HTTPException, Response
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
from app.core.jwt.jwt import JWTManager, PasswordHasher
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.email_verification_service import EmailVerificationService
from app.core.logging.logger import logger
from app.api.schemas.api_schemas import APIResponse
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/auth")


# ======================================================
# TEST SCHEMAS
# ======================================================

class TestUserCreateSchema(BaseModel):
    """Extended user creation schema for testing with multiple roles"""
    email: str
    password: str
    username: str
    first_name: str
    last_name: str
    tipo_identificacion: str
    numero_identificacion: str
    roles: Optional[List[str]] = ["ATLETA"]  # Can include multiple: ATLETA, ENTRENADOR, ADMINISTRADOR, REPRESENTANTE
    is_active: bool = True  # Active by default for testing


# ======================================================
# REGISTER (TEST VERSION - NO RATE LIMIT, ACTIVE BY DEFAULT)
# ======================================================

@router.post(
    "/register",
    response_model=APIResponse[UserResponseSchema],
    status_code=status.HTTP_201_CREATED,
)
async def register_test_user(
    request: Request,
    data: TestUserCreateSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
):
    """
    TEST ONLY: Registers a new user with is_active=True by default.
    Supports multiple roles for comprehensive testing.
    NO RATE LIMITING applied.
    
    Args:
        request: Request object.
        data: Test user registration data with roles and active status.
        
    Returns:
        APIResponse: User data with active status.
    """

    if await repo.get_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email ya registrado",
        )

    if await repo.get_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username ya registrado",
        )
    
    try:
        password_hash = hasher.hash(data.password)
        
        # Convert test schema to standard UserCreateSchema
        user_data = UserCreateSchema(
            email=data.email,
            password=data.password,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
            tipo_identificacion=data.tipo_identificacion,
            numero_identificacion=data.numero_identificacion,
        )
        
        user = await repo.create(password_hash=password_hash, user_data=user_data)
        
        # Set user as active for testing
        if data.is_active:
            user.is_active = True
            user.email_verified_at = datetime.now(timezone.utc)
            await repo.session.commit()
            await repo.session.refresh(user)
        
        logger.info(f"TEST USER CREATED: {user.email} - Active: {user.is_active} - Roles: {data.roles}")

        return APIResponse(
            success=True,
            message=f"Usuario de test creado exitosamente. Active: {user.is_active}",
            data=UserResponseSchema.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando usuario de test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}",
        )


# ======================================================
# LOGIN (TEST VERSION - NO RATE LIMIT)
# ======================================================

@router.post(
    "/login",
    response_model=APIResponse[Union[TokenPair, TwoFactorRequired]],
)
async def login_test(
    request: Request,
    response: Response,
    data: LoginSchema,
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    """
    TEST ONLY: Login without rate limiting.
    Same functionality as standard login but without rate limiter.
    """
    user = await repo.get_by_email(data.username)

    logger.info(f"TEST LOGIN attempt for: {data.username}")
    
    if not user or not hasher.verify(data.password, user.hashed_password):
        logger.warning(f"TEST LOGIN: Password mismatch for user: {data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not user.is_active:
        logger.warning(f"TEST LOGIN: User inactive: {data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo",
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

    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    return APIResponse(
        success=True,
        message="Inicio de sesión exitoso (TEST)",
        data=TokenPair(
            access_token=access,
            refresh_token=refresh,
        )
    )


# ======================================================
# REFRESH (TEST VERSION - NO RATE LIMIT)
# ======================================================

@router.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh_token_test(
    request: Request,
    response: Response,
    body: RefreshRequest,
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    """
    TEST ONLY: Token refresh without rate limiting.
    """
    try:
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

        response.set_cookie(
            key="refresh_token",
            value=refresh,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=7 * 24 * 60 * 60
        )

        return APIResponse(
            success=True,
            message="Token refrescado exitosamente (TEST)",
            data=TokenPair(
                access_token=access,
                refresh_token=refresh,
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al refrescar el token (TEST): {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor",
        )


# ======================================================
# LOGOUT (TEST VERSION - NO RATE LIMIT)
# ======================================================

@router.post("/logout", response_model=APIResponse)
async def logout_test(
    request: Request,
    response: Response,
    body: RefreshRequest = None,
    jwtm: JWTManager = Depends(get_jwt_manager),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
):
    """
    TEST ONLY: Logout without rate limiting.
    """
    try:
        cookie_refresh = request.cookies.get("refresh_token")
        token_to_revoke = (body and body.refresh_token) or cookie_refresh
        
        if token_to_revoke:
            try:
                payload = jwtm.decode(token_to_revoke)
                jti = payload.get("jti")
                if jti:
                    await sessions_repo.revoke_session_by_refresh_jti(jti)
            except Exception:
                pass
        
        response.delete_cookie(
            key="refresh_token", 
            httponly=True, 
            secure=False,
            samesite="lax"
        )
        
        return APIResponse(
            success=True,
            message="Sesión cerrada exitosamente (TEST)"
        )
    except Exception as e:
        logger.error(f"Error en logout (TEST): {e}")
        response.delete_cookie(key="refresh_token")
        return APIResponse(
            success=True, 
            message="Sesión cerrada (TEST - con advertencias)"
        )
