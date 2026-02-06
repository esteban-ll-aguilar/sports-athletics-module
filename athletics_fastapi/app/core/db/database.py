from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from app.core.config.enviroment import _SETTINGS
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
            # Inicializar engine y session factory AQUÍ, una sola vez
            # Configuración de conexión con soporte para Azure (SSL)
            connect_args = {
                "server_settings": {
                    "application_name": "athletics_fastapi",
                    "jit": "off"  # Desactivar JIT para consultas rápidas
                },
                "command_timeout": 60,  # Timeout de comandos SQL
                "timeout": 15,  # Aumentado para Azure
            }

            # Si el host es de Azure, forzar SSL
            if "azure.com" in _SETTINGS.database_host.lower():
                connect_args["ssl"] = "require"

            cls._instance._engine = create_async_engine(
                _SETTINGS.database_url_async,
                pool_size=_SETTINGS.database_pool_size,
                max_overflow=_SETTINGS.database_max_overflow,
                pool_pre_ping=True,
                pool_recycle=_SETTINGS.database_pool_recycle,
                pool_timeout=_SETTINGS.database_pool_timeout,
                pool_use_lifo=True,
                echo=False,
                connect_args=connect_args,
            )
            cls._instance._session_factory = async_sessionmaker(
                cls._instance._engine, 
                expire_on_commit=False
            )
        return cls._instance
    
    #metodo para obtener el engine de la base de datos
    def get_engine(self) -> AsyncEngine:
        return self._engine
    
    #metodo para obtener la fábrica de sesiones
    def get_session_factory(self) -> async_sessionmaker[AsyncSession]:
        return self._session_factory


# Instancia global
_db = DatabaseBase()

# Dependencia para FastAPI que proporciona sesiones de base de datos
# abre una nueva sesión para cada solicitud y la cierra al finalizar
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    #obtener la fábrica de sesiones
    session_factory = _db.get_session_factory()
    async with session_factory() as session:#abrir una nueva sesión
        try:
            yield session
        finally:
            await session.close()