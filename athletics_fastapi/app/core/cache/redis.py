""""Módulo para la gestión del cliente Redis asíncrono.
    Este módulo proporciona una implementación singleton para el cliente Redis,
    asegurando que solo exista una instancia durante el ciclo de vida de la aplicación.
    También incluye una dependencia de FastAPI para inyectar el cliente Redis en las rutas.
"""

# importaciones de Redis
from redis.asyncio import Redis
from typing import AsyncGenerator

# Clase singleton para el cliente Redis
class RedisClient:
    _instance = None
    _client: Redis | None = None
    #
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    # Método para obtener el cliente Redis
    def get_client(self) -> Redis:
        if self._client is None:
            from app.core.config.enviroment import _SETTINGS
            self._client = Redis.from_url(
                _SETTINGS.redis_url, 
                decode_responses=True,
                encoding="utf-8",
                max_connections=10
            )
        return self._client
    # Método para cerrar la conexión del cliente Redis
    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


# Instancia global
_redis = RedisClient()

# Dependencia de FastAPI para obtener el cliente Redis
async def get_redis() -> AsyncGenerator[Redis, None]:
    # Importa el logger para registrar eventos
    from app.core.logging.logger import logger
    
    logger.info("Getting Redis client")
    
    client = _redis.get_client()
    try:
        yield client
    finally:
        logger.info("Redis client returned")