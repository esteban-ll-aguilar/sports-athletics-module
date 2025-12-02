from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from app.core.config.enviroment import _SETTINGS
from functools import lru_cache
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class DatabaseBase:
    _instance = None
    _engine: AsyncEngine | None = None
    _session_factory: async_sessionmaker[AsyncSession] | None = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def get_engine(self) -> AsyncEngine:
        if self._engine is None:
            self._engine = create_async_engine(
                _SETTINGS.database_url_async,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=1800,
                echo=True,  # TODO: QUITAR en producción
            )
            self._session_factory = async_sessionmaker(
                self._engine, 
                expire_on_commit=False
            )
        return self._engine

    def get_session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._session_factory is None:
            self.get_engine()
        return self._session_factory


# Instancia global
_db = DatabaseBase()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for FastAPI to get database sessions"""
    from app.core.logging.logger import logger
    logger.info("Creating new database session")
    
    session_factory = _db.get_session_factory()
    async with session_factory() as session:
        try:
            logger.info("Database session created")
            yield session
        finally:
            await session.close()
            logger.info("Database session closed")