import pytest
import pytest_asyncio
import asyncio
import sys
import os
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from app.main import _APP
from app.core.db.database import _db
from typing import Optional

# Asegurar imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Event loop (OBLIGATORIO)
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# ✅ CLIENTE ASYNC CORRECTO
@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=_APP),
        base_url="http://test"
    ) as c:
        yield c

# DB session
@pytest_asyncio.fixture(scope="function")
async def db_session():
    """
    Proporciona una sesión de base de datos para cada test (función).
    Permite transacciones aisladas si se habilita el rollback.
    """
    session_factory = _db.get_session_factory()
    async with session_factory() as session:
        yield session
