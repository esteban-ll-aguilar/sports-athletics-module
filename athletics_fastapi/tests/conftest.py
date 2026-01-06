"""
Configuración global de fixtures para Pytest.
Este archivo contiene fixtures compartidos que se pueden utilizar en todos los tests.
"""
import pytest
import asyncio
import sys
import os
from typing import AsyncGenerator

# Agregar el directorio raíz al path para que los imports funcionen correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from httpx import AsyncClient, ASGITransport
from app.main import _APP
from app.core.db.database import DatabaseBase, _db

# Fixture para manejar el loop de eventos en pruebas asincronas
@pytest.fixture(scope="session")
def event_loop():
    """
    Define el loop de eventos para la sesión de pruebas.
    Necesario para pruebas asíncronas con pytest-asyncio.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Fixture para el cliente HTTP asincrono
@pytest.fixture(scope="session")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente HTTP asíncrono para realizar peticiones a la API.
    Utiliza ASGITransport para conectar directamente con la app FastAPI.
    """
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# Fixture para la sesion de base de datos
@pytest.fixture(scope="function")
async def db_session():
    """
    Proporciona una sesión de base de datos para cada test (función).
    Permite transacciones aisladas si se habilita el rollback.
    """
    # En un entorno real, aqui podriamos:
    # 1. Crear una bases de datos de prueba
    # 2. Usar transacciones y rollback
    # Por ahora usaremos la misma conexion pero asegurando limpieza basica si es necesario
    session_factory = _db.get_session_factory()
    async with session_factory() as session:
        yield session
        # Rollback automatico despues de cada test si se desea
        # await session.rollback()
