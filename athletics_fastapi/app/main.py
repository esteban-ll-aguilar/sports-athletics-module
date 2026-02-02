from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config.enviroment import _SETTINGS
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from app.utils.response_handler import ResponseHandler
from app.utils.response_codes import ResponseCodes
from prometheus_fastapi_instrumentator import Instrumentator

import asyncio



async def cleanup_sessions_periodically(logger):
    """Limpia sesiones expiradas cada hora."""
    from app.core.db.database import _db
    from app.modules.auth.repositories.sessions_repository import SessionsRepository
    try:
        while True:
            await asyncio.sleep(3600)  # Cada hora
            try:
                async with _db.get_session_factory()() as session:
                    repo = SessionsRepository(session)
                    count = await repo.cleanup_expired_sessions()
                    await session.commit()
                    if count > 0:
                        logger.info(f"🧹 Cleaned up {count} expired sessions")
            except Exception as e:
                logger.error(f"❌ Error cleaning sessions: {e}")
    except asyncio.CancelledError:
         logger.info("🛑 Cleanup task cancelled")
         return

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from app.core.logging.logger import logger
    
    from app.core.db.database import _db
    from app.core.cache.redis import _redis
    from app.core.jwt.secret_rotation import JWTSecretRotation
    from app.modules.auth.repositories.sessions_repository import SessionsRepository


    
    logger.info("🚀 Starting up application...")
    
    # Inicializa base de datos
    logger.info("📊 Initializing database connection...")
    db_engine = _db.get_engine()
    try:
        async with db_engine.begin() as conn:
            logger.info("✅ Database connection established")       
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise e
    
    # Inicializa Redis
    logger.info("📊 Initializing Redis connection...")
    redis_client = _redis.get_client()
    try:
        await redis_client.ping()
        logger.info("✅ Redis connection established")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        raise e
    
    # Verificar rotación de JWT secrets
    logger.info("🔐 Checking JWT secret rotation...")
    try:
        rotation = JWTSecretRotation()
        if rotation.should_rotate():
            logger.warning("🔄 Rotating JWT secrets automatically...")
            result = rotation.rotate()
            logger.info(f"✅ JWT secret rotated successfully at {result['rotated_at']}")
        else:
            info = rotation.get_rotation_info()
            logger.info(f"✅ JWT secret is current (next rotation in {info['days_until_rotation']} days)")
    except Exception as e:
        logger.error(f"❌ JWT rotation check failed: {e}")
    
    # Iniciar tarea de limpieza
    cleanup_task = asyncio.create_task(cleanup_sessions_periodically(logger))
    logger.info("🧹 Session cleanup task started")
    
    logger.info("✨ Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down application...")
    
    # Cancelar tarea de limpieza
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        logger.info("✅ Session cleanup task cancelled")
    
    # Cierra Redis
    logger.info("🔴 Closing Redis connection...")
    await _redis.close()
    logger.info("✅ Redis connection closed")
    
    # Cierra base de datos
    logger.info("📊 Closing database connection...")
    await db_engine.dispose()
    logger.info("✅ Database connection closed")
    
    logger.info("👋 Application shutdown complete")


# Inicializar rate limiter
limiter = Limiter(key_func=get_remote_address)


_APP = FastAPI(
    title='API Modulo de Atletismo',
    description=(
        "El API Modulo de Atletismo es una herramienta que permite gestionar las competiciones de atletismo."
    ),
    version=_SETTINGS.application_version,
    docs_url='/',
    redoc_url='/doc',
    contact={
        'name': 'Equipo de Desarrollo',
        'email': 'esteban.leon@unl.edu.ec',
        'url': 'https://dalios.solutions',
    },
    lifespan=lifespan
)

# Instrumentar Prometheus para métricas de rendimiento
Instrumentator().instrument(_APP).expose(_APP, endpoint="/metrics", include_in_schema=True)

# ✅ 2. LUEGO MONTAS STATIC FILES

_APP.mount("/data", StaticFiles(directory="data"), name="data")




# Health check endpoint
@_APP.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "message": "Service is healthy",
        "version": _SETTINGS.application_version
    }

# Agregar el state del limiter a la app
_APP.state.limiter = limiter

# Handler Global para Exception (500)
@_APP.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from app.core.logging.logger import logger
    logger.error(f"❌ GLOBAL ERROR: {exc}", exc_info=True)
    
    response_data = ResponseHandler.error_response(
        summary="Error interno del servidor",
        message=str(exc),
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code=ResponseCodes.COD_INTERNAL_ERROR
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response_data,
        headers={
            "Access-Control-Allow-Origin": _SETTINGS.cors_allow_origins if _SETTINGS.cors_allow_origins != "*" else "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Handler Global para HTTPException (4xx, etc)
@_APP.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Personalizar respuesta según el código de estado
    if exc.status_code == status.HTTP_401_UNAUTHORIZED:
        response_data = ResponseHandler.unauthorized_response(
            message=exc.detail
        )
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        response_data = ResponseHandler.forbidden_response(
            message=exc.detail
        )
    elif exc.status_code == status.HTTP_404_NOT_FOUND:
        response_data = ResponseHandler.not_found_response(
            entity="Recurso",
            message=exc.detail
        )
    else:
        response_data = ResponseHandler.error_response(
            summary="Error en la solictud",
            message=exc.detail,
            status_code=exc.status_code
        )
        
    return JSONResponse(
        status_code=exc.status_code,
        content=response_data
    )

# Handler Global para RequestValidationError (422)
@_APP.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Formatear errores de validación
    errors = {}
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"])
        message = error["msg"]
        errors[field] = message

    response_data = ResponseHandler.validation_error_response(
        summary="Error de validación",
        message="Los datos enviados no son válidos",
        errors=errors
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=response_data
    )

# Agregar handler para rate limit exceeded
_APP.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configurar CORS
# Configurar CORS
# Nota: allow_origins=["*"] no funciona con allow_credentials=True.
# Definimos orígenes explícitos para desarrollo.
origins = _SETTINGS.cors_allow_origins.split(",") if _SETTINGS.cors_allow_origins != "*" else [
    "http://localhost",
    "http://localhost:5173", # Vite default
    "http://localhost:3000", # React default
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

_APP.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # _SETTINGS.cors_allow_credentials, force true for cookies
    allow_methods=_SETTINGS.cors_allow_methods.split(",") if _SETTINGS.cors_allow_methods != "*" else ["*"],
    allow_headers=_SETTINGS.cors_allow_headers.split(",") if _SETTINGS.cors_allow_headers != "*" else ["*"],
)

from app.api.api_v1 import router_api_v1 as api_v1_router

_APP.include_router(api_v1_router)
@_APP.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Error de validación en la solicitud. Revisa los campos enviados.",
        }
    )