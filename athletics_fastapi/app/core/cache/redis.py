from redis.asyncio import Redis
from typing import AsyncGenerator

class RedisClient:
    _instance = None
    _client: Redis | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

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

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


# Instancia global
_redis = RedisClient()


async def get_redis() -> AsyncGenerator[Redis, None]:
    """Dependency for FastAPI to get Redis client"""
    from app.core.logging.logger import logger
    logger.info("Getting Redis client")
    
    client = _redis.get_client()
    try:
        yield client
    finally:
        logger.info("Redis client returned")