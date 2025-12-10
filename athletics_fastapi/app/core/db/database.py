from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from app.core.config.enviroment import _SETTINGS
from functools import lru_cache
from sqlalchemy.orm import DeclarativeBase

#Clase base para los modelos de la base de datos
class Base(DeclarativeBase):
    pass

#Clase que gestiona la conexión a la base de datos y la creación de sesiones
# Implementa el patrón singleton para asegurar una única instancia
class DatabaseBase:
    _instance = None
    _engine: AsyncEngine | None = None
    _session_factory: async_sessionmaker[AsyncSession] | None = None


    #metodo para implementar el patrón singleton
    #si ya existe una instancia, devuelve esa instancia, si no, crea una nueva
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    #metodo para obtener el engine de la base de datos
    #si no existe, lo crea con los parámetros de configuración
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

    
    #metodo para obtener la fábrica de sesiones
    #si no existe, llama a get_engine para crearla
    def get_session_factory(self) -> async_sessionmaker[AsyncSession]:
        if self._session_factory is None:
            self.get_engine()
        return self._session_factory


# Instancia global
_db = DatabaseBase()

# Dependencia para FastAPI que proporciona sesiones de base de datos
# abre una nueva sesión para cada solicitud y la cierra al finalizar
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    # Importar logger aquí para evitar dependencias circulares
    from app.core.logging.logger import logger
    logger.info("Creating new database session")
    #obtener la fábrica de sesiones
    session_factory = _db.get_session_factory()
    async with session_factory() as session:#abrir una nueva sesión
        try:
            logger.info("Database session created") 
            yield session
        finally:
            await session.close()
            logger.info("Database session closed")