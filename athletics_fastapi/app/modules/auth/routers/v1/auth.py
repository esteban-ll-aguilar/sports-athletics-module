from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.modules.auth.domain.schemas import (
    UserCreate, UserRead, TokenPair, RefreshRequest, TwoFactorRequired
)
from app.modules.auth.dependencies import (
    get_users_repo, get_sessions_repo, get_jwt_manager, 
    get_password_hasher, get_email_service,
    get_email_verification_service
)
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.core.jwt.jwt import JWTManager, PasswordHasher, oauth2_scheme
from app.modules.auth.services.auth_email_service import AuthEmailService
from app.modules.auth.services.email_verification_service import EmailVerificationService
from app.core.logging.logger import logger
from typing import Union
from datetime import datetime, timezone
from app.modules.modules import APP_TAGS_V1

# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)

auth_router_v1 = APIRouter()

@auth_router_v1.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")  # Limitar a 3 registros por hora por IP
async def register(
    request: Request,  # Necesario para el limiter
    data: UserCreate,
    repo: AuthUsersRepository = Depends(get_users_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
):
    """
    Registra un nuevo usuario en el sistema con validaciones completas.
    
    Validaciones:
    - Email único
    - Username único
    - Cédula única (si se proporciona)
    - Password fuerte (validado en schema)
    - Rol válido (ATLETA, REPRESENTANTE, ENTRENADOR)
    """
    # Validar unicidad de email
    if await repo.get_by_email(data.email):
        logger.warning(f"Intento de registro con email duplicado: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="El email ya está registrado"
        )
    
    # Validar unicidad de username (nombre)
    if await repo.get_by_username(data.username):
        logger.warning(f"Intento de registro con username duplicado: {data.username}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="El username ya está registrado"
        )
    
    # Validar unicidad de cédula (si se proporciona)
    if data.cedula:
        existing_cedula = await repo.get_by_cedula(data.cedula)
        if existing_cedula:
            logger.warning(f"Intento de registro con cédula duplicada: {data.cedula}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="La cédula ya está registrada"
            )
    
    # Hashear password
    password_hash = hasher.hash(data.password)
    
    # Crear usuario ACTIVO con el rol especificado
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel
    
    user = AuthUserModel(
        email=data.email,
        hashed_password=password_hash,
        is_active=True,
        role=data.role,
        nombre=data.nombre_completo or data.username,  # Usar nombre completo o username
        cedula=data.cedula,
        fecha_nacimiento=data.fecha_nacimiento,
        sexo=data.sexo,
        phone=data.telefono
    )
    
    # Persistir en BD
    created_user = await repo.create_user(user)
    await repo.session.commit()
    await repo.session.refresh(created_user)
    
    logger.info(f"Nuevo usuario registrado: {created_user.email} (rol: {data.role}, username: {data.username})")
    
    return UserRead.model_validate(created_user)
    
    return UserRead.model_validate(created_user)

@auth_router_v1.post("/login", response_model=Union[TokenPair, TwoFactorRequired])
@limiter.limit("5/minute")  # Limitar a 5 intentos por minuto por IP
async def login(
    request: Request,  # Necesario para el limiter
    form: OAuth2PasswordRequestForm = Depends(),
    repo: AuthUsersRepository = Depends(get_users_repo),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    hasher: PasswordHasher = Depends(get_password_hasher),
    jwtm: JWTManager = Depends(get_jwt_manager),
) -> Union[TokenPair, TwoFactorRequired]:
    """
    Autentica un usuario y retorna tokens de acceso.
    Protegido contra timing attacks.
    Guarda sesión en BD para auditoría.
    Si el usuario tiene 2FA habilitado, retorna TwoFactorRequired con token temporal en el body.
    """
    user = await repo.get_by_email(form.username)
    
    # Siempre verificar hash aunque user sea None (prevenir timing attack)
    is_valid = False
    if user.is_active == False:
        logger.warning(f"Intento de login fallido para usuario inactivo: {form.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Usuario inactivo, por favor verifica tu email"
        )
    if user and user.is_active:
        is_valid = hasher.verify(form.password, user.hashed_password)
    
    if not is_valid:
        logger.warning(f"Intento de login fallido para: {form.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Credenciales inválidas"
        )
    
    # Si tiene 2FA habilitado, retornar token temporal en el body
    if user.two_factor_enabled:
        # Crear token temporal de corta duración (5 minutos)
        temp_token = jwtm.create_access_token(str(user.id))
        logger.info(f"Login paso 1 exitoso (2FA requerido) para: {user.email}")
        return TwoFactorRequired(
            temp_token=temp_token,
            message="2FA requerido. Usa el endpoint /2fa/login con tu código TOTP"
        )
    
    # Login normal sin 2FA
    # Generar tokens
    access = jwtm.create_access_token(str(user.id))
    refresh = jwtm.create_refresh_token(str(user.id))
    
    # Decodificar para obtener JTIs y exp
    access_payload = jwtm.decode(access)
    refresh_payload = jwtm.decode(refresh)
    
    # Guardar en Redis (validación rápida)
    await jwtm.store_refresh(refresh_payload["jti"], str(user.id), refresh_payload["exp"])
    
    # Verificar si ya existe una sesión activa para este usuario
    existing_session = await sessions_repo.get_latest_active_session(user.id)
    
    if existing_session:
        # Reutilizar sesión existente, solo actualizar tokens
        logger.info(f"Reutilizando sesión existente para usuario: {user.email}")
        await sessions_repo.update_session_tokens(
            session_id=existing_session.id,
            new_access_jti=access_payload["jti"],
            new_refresh_jti=refresh_payload["jti"],
            new_expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    else:
        # Crear nueva sesión solo si no existe
        logger.info(f"Creando nueva sesión para usuario: {user.email}")
        await sessions_repo.create_session(
            user_id=user.id,
            access_jti=access_payload["jti"],
            refresh_jti=refresh_payload["jti"],
            expires_at=datetime.fromtimestamp(refresh_payload["exp"], tz=timezone.utc)
        )
    
    await repo.session.commit()
    
    logger.info(f"Login exitoso para usuario: {user.email}")
    return TokenPair(access_token=access, refresh_token=refresh)




@auth_router_v1.post("/refresh", response_model=TokenPair)
async def refresh_token(
    body: RefreshRequest,
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Renueva el access token usando el refresh token.
    Actualiza la sesión en BD con el nuevo access JTI.
    """
    payload = jwtm.decode(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido")
    jti = payload.get("jti")
    sub = payload.get("sub")
    if not jti or not sub:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido")

    # Debe existir y se consume (rotación)
    sub_stored = await jwtm.consume_refresh(jti)
    if not sub_stored or sub_stored != sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh inválido o reutilizado")

    # Emitir nuevos tokens y guardar nuevo refresh
    access = jwtm.create_access_token(sub)
    new_refresh = jwtm.create_refresh_token(sub)
    
    # Decodificar para obtener JTIs
    access_payload = jwtm.decode(access)
    nr_payload = jwtm.decode(new_refresh)
    
    # Guardar en Redis
    await jwtm.store_refresh(nr_payload["jti"], nr_payload["sub"], nr_payload["exp"])
    
    # Actualizar sesión en BD con nuevo access JTI
    await sessions_repo.update_session_access_token(jti, access_payload["jti"])
    
    logger.info(f"Token refresh exitoso para usuario: {sub}")
    return TokenPair(access_token=access, refresh_token=new_refresh)

@auth_router_v1.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: RefreshRequest,
    token: str = Depends(oauth2_scheme),  # Recibe también el access token
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    jwtm: JWTManager = Depends(get_jwt_manager)
):
    """
    Cierra la sesión revocando tanto el access token como el refresh token.
    Revoca en Redis (rápido) y BD (auditoría).
    """
    # Revocar access token
    try:
        access_payload = jwtm.decode(token)
        if access_jti := access_payload.get("jti"):
            await jwtm.revoke_until(access_jti, access_payload["exp"])
            await sessions_repo.revoke_session_by_access_jti(access_jti)
            logger.info(f"Access token revocado: {access_jti}")
    except Exception as e:
        logger.error(f"Error al revocar access token: {e}")
        pass
    
    # Revocar refresh token
    try:
        refresh_payload = jwtm.decode(body.refresh_token)
        if refresh_jti := refresh_payload.get("jti"):
            await jwtm.revoke_until(refresh_jti, refresh_payload["exp"])
            await jwtm.consume_refresh(refresh_jti)  # También eliminar de lista válidos
            await sessions_repo.revoke_session_by_refresh_jti(refresh_jti)
            logger.info(f"Refresh token revocado: {refresh_jti}")
    except Exception as e:
        logger.error(f"Error al revocar refresh token: {e}")
        pass
    
    return


