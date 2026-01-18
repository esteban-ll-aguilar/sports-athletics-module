from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config.enviroment import _SETTINGS
import asyncio


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
    
    # Tarea de limpieza de sesiones expiradas
    async def cleanup_sessions_periodically():
        """Limpia sesiones expiradas cada hora."""
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
    
    # Iniciar tarea de limpieza
    cleanup_task = asyncio.create_task(cleanup_sessions_periodically())
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
    title='API Dalios Facturacion SRI',
    description=(
        "La API Dalios Facturacion SRI es el motor detrás de la aplicación Dalios, diseñada para gestionar todo el flujo de operaciones de un servicio de entrega eficiente y moderno. "
        "Además, esta API está optimizada para integrarse con servicios externos, y ofrecer una experiencia fluida tanto para los administradores como para los clientes. "
        "Con capacidades en manejo de datos, Dalios es tu solución todo en uno para administrar un negocio de entregas con eficacia y confianza."
    ),
    version=_SETTINGS.application_version,
    docs_url='/',
    redoc_url='/doc',
    contact={
        'name': 'Equipo de Desarrollo Dalios',
        'email': 'dalios.solutions@gmail.com',
        'url': 'https://dalios.solutions',
    },
    lifespan=lifespan
)

# Agregar el state del limiter a la app
_APP.state.limiter = limiter

@_APP.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    from app.core.logging.logger import logger
    logger.error(f"❌ GLOBAL ERROR: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "message": str(exc)},
        headers={
            "Access-Control-Allow-Origin": _SETTINGS.cors_allow_origins if _SETTINGS.cors_allow_origins != "*" else "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Agregar handler para rate limit exceeded
_APP.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configurar CORS
_APP.add_middleware(
    CORSMiddleware,
    allow_origins=_SETTINGS.cors_allow_origins.split(",") if _SETTINGS.cors_allow_origins != "*" else ["*"],
    allow_credentials=_SETTINGS.cors_allow_credentials,
    allow_methods=_SETTINGS.cors_allow_methods.split(",") if _SETTINGS.cors_allow_methods != "*" else ["*"],
    allow_headers=_SETTINGS.cors_allow_headers.split(",") if _SETTINGS.cors_allow_headers != "*" else ["*"],
)

from app.api.api_v1 import router_api_v1 as api_v1_router

_APP.include_router(api_v1_router)