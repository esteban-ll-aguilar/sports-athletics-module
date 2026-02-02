"""
Auth Test Router - No Rate Limiting
Reimplements all auth routes WITHOUT rate limiting for testing.
Custom registration allows creating users with any role including ADMINISTRADOR.
"""
from fastapi import APIRouter, Depends, status, Request, HTTPException, Response
from typing import Optional, List, Union
from datetime import datetime, timezone
from pydantic import BaseModel

from app.modules.auth.domain.schemas import (
    UserCreateSchema, 
    UserResponseSchema,
    TokenPair,
    RefreshRequest,
    TwoFactorRequired,
    LoginSchema
)
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.dependencies import (
    get_users_repo,
    get_sessions_repo,
    get_jwt_manager,
    get_password_hasher,
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.core.jwt.jwt import JWTManager, PasswordHasher
from app.core.logging.logger import logger
from app.api.schemas.api_schemas import APIResponse

# Import routers without rate limiting (users, user_management, password_reset)
from app.modules.auth.routers.v1.users import users_router_v1
from app.modules.auth.routers.v1.user_management_router import user_management_router_v1
from app.modules.auth.routers.v1.password_reset import reset_password_router_v1

router = APIRouter(prefix="/auth")

# Include routers that DON'T have rate limiting
router.include_router(users_router_v1, prefix="/users")
router.include_router(user_management_router_v1, prefix="/users")
router.include_router(reset_password_router_v1, prefix="/password-reset")

# NOTE: We DON'T include auth_router_v1, auth_email_router_v1, auth_sessions_router_v1, 
# or auth_twofa_router_v1 because they have @limiter.limit() decorators.
# Instead, we reimplement the core routes below WITHOUT rate limiting.


# ======================================================
# CUSTOM TEST REGISTRATION - ALLOWS ANY ROLE INCLUDING ADMINISTRADOR
# ======================================================

class TestUserCreateSchema(BaseModel):
    """Extended user creation schema for testing with any role support"""
    email: str
    password: str
    username: str
    first_name: str
    last_name: str
    tipo_identificacion: str
    identificacion: str
    tipo_estamento: str
    direccion: Optional[str] = "Test Address"
    phone: Optional[str] = "0999999999"
    roles: Optional[List[str]] = ["ATLETA"]  # Can include: ATLETA, ENTRENADOR, ADMINISTRADOR, REPRESENTANTE
    is_active: bool = True  # Active by default for testing


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
    Supports ANY role including ADMINISTRADOR for comprehensive testing.
    NO RATE LIMITING applied.
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
            identificacion=data.identificacion,
            tipo_estamento=data.tipo_estamento,
            direccion=data.direccion if data.direccion else "Test Address",
            phone=data.phone if data.phone else "0999999999",
            role=RoleEnum(data.roles[0]) if data.roles else RoleEnum.ATLETA
        )
        
        user = await repo.create(password_hash=password_hash, user_data=user_data)
        
        # Set user as active for testing & Update to Admin if requested
        if data.is_active or (data.roles and data.roles[0] == "ADMINISTRADOR"):
            user.auth.is_active = True
            user.auth.email_confirmed_at = datetime.now(timezone.utc)
            
            if data.roles and data.roles[0] == "ADMINISTRADOR":
                user.role = RoleEnum.ADMINISTRADOR
                
            await repo.db.commit()
            user = await repo.get_by_id_profile(user.id)
        
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
# LOGIN (NO RATE LIMITING)
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
    """TEST: Login without rate limiting"""
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
        message="Inicio de sesión exitoso",
        data=TokenPair(
            access_token=access,
            refresh_token=refresh,
        )
    )


# ======================================================
# REFRESH (NO RATE LIMITING)
# ======================================================

@router.post("/refresh", response_model=APIResponse[TokenPair])
async def refresh_token_test(
    request: Request,
    response: Response,
    body: RefreshRequest,
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager),
):
    """TEST: Refresh token without rate limiting"""
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
# LOGOUT (NO RATE LIMITING)
# ======================================================

@router.post("/logout", response_model=APIResponse)
async def logout_test(
    request: Request,
    response: Response,
    body: RefreshRequest = None,
    jwtm: JWTManager = Depends(get_jwt_manager),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
):
    """TEST: Logout without rate limiting"""
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
            message="Sesión cerrada exitosamente"
        )
    except Exception as e:
        logger.error(f"Error en logout: {e}")
        response.delete_cookie(key="refresh_token")
        return APIResponse(
            success=True,
            message="Sesión cerrada (con advertencias)"
        )
