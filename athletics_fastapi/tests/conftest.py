"""
Configuración global de fixtures para Pytest.
Este archivo contiene fixtures compartidos que se pueden utilizar en todos los tests.
"""
import pytest
import pytest_asyncio
import sys
import os
from typing import AsyncGenerator

# Agregar el directorio raíz al path para que los imports funcionen correctamente
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from httpx import AsyncClient, ASGITransport
from app.main import _APP
from app.core.db.database import DatabaseBase, _db

# Fixture para el cliente HTTP asincrono
@pytest_asyncio.fixture(loop_scope="function", scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Cliente HTTP asíncrono para realizar peticiones a la API.
    Utiliza ASGITransport para conectar directamente con la app FastAPI.
    """
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# Fixture para la sesion de base de datos
@pytest_asyncio.fixture(loop_scope="function", scope="function")
async def db_session():
    """
    Proporciona una sesión de base de datos para cada test (función).
    Permite transacciones aisladas si se habilita el rollback.
    """
    session_factory = _db.get_session_factory()
    async with session_factory() as session:
        yield session

