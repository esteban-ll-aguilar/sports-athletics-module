import pytest
import pytest_asyncio
import asyncio
import sys
import os
from typing import AsyncGenerator, Dict, Any
from httpx import AsyncClient, ASGITransport
from app.main import _APP
from app.core.db.database import _db

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


# ======================================================
# MULTI-ROLE TEST USER FIXTURES
# ======================================================

@pytest_asyncio.fixture(scope="function")
async def test_atleta_user(client: AsyncClient) -> Dict[str, Any]:
    """Create and authenticate a test athlete user (active by default)"""
    user_data = {
        "email": f"atleta_test_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"atleta_test_{os.urandom(4).hex()}",
        "first_name": "Test",
        "last_name": "Atleta",
        "tipo_identificacion": "CEDULA",
        "numero_identificacion": f"17{os.urandom(4).hex()}",
        "roles": ["ATLETA"],
        "is_active": True
    }
    
    # Register user via test endpoint (no rate limit, active by default)
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    assert response.status_code == 201
    user = response.json()["data"]
    
    # Login to get token
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()["data"]
    
    return {
        "user_id": user["id"],
        "email": user_data["email"],
        "token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "user_data": user
    }


@pytest_asyncio.fixture(scope="function")
async def test_entrenador_user(client: AsyncClient) -> Dict[str, Any]:
    """Create and authenticate a test coach user"""
    user_data = {
        "email": f"entrenador_test_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"entrenador_test_{os.urandom(4).hex()}",
        "first_name": "Test",
        "last_name": "Entrenador",
        "tipo_identificacion": "CEDULA",
        "numero_identificacion": f"17{os.urandom(4).hex()}",
        "roles": ["ENTRENADOR"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    assert response.status_code == 201
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()["data"]
    
    return {
        "user_id": user["id"],
        "email": user_data["email"],
        "token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "user_data": user
    }


@pytest_asyncio.fixture(scope="function")
async def test_admin_user(client: AsyncClient) -> Dict[str, Any]:
    """Create and authenticate a test admin user"""
    user_data = {
        "email": f"admin_test_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"admin_test_{os.urandom(4).hex()}",
        "first_name": "Test",
        "last_name": "Admin",
        "tipo_identificacion": "CEDULA",
        "numero_identificacion": f"17{os.urandom(4).hex()}",
        "roles": ["ADMINISTRADOR"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    assert response.status_code == 201
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()["data"]
    
    return {
        "user_id": user["id"],
        "email": user_data["email"],
        "token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "user_data": user
    }


@pytest_asyncio.fixture(scope="function")
async def test_representante_user(client: AsyncClient) -> Dict[str, Any]:
    """Create and authenticate a test representative user"""
    user_data = {
        "email": f"representante_test_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"representante_test_{os.urandom(4).hex()}",
        "first_name": "Test",
        "last_name": "Representante",
        "tipo_identificacion": "CEDULA",
        "numero_identificacion": f"17{os.urandom(4).hex()}",
        "roles": ["REPRESENTANTE"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    assert response.status_code == 201
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()["data"]
    
    return {
        "user_id": user["id"],
        "email": user_data["email"],
        "token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "user_data": user
    }


@pytest_asyncio.fixture(scope="function")
async def test_multi_role_user(client: AsyncClient) -> Dict[str, Any]:
    """Create user with multiple roles (e.g., ATLETA + ENTRENADOR)"""
    user_data = {
        "email": f"multirole_test_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"multirole_test_{os.urandom(4).hex()}",
        "first_name": "Test",
        "last_name": "MultiRole",
        "tipo_identificacion": "CEDULA",
        "numero_identificacion": f"17{os.urandom(4).hex()}",
        "roles": ["ATLETA", "ENTRENADOR"],  # Multiple roles
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    assert response.status_code == 201
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()["data"]
    
    return {
        "user_id": user["id"],
        "email": user_data["email"],
        "token": token_data["access_token"],
        "refresh_token": token_data["refresh_token"],
        "user_data": user,
        "roles": user_data["roles"]
    }


# ======================================================
# AUTHENTICATED CLIENT FIXTURES
# ======================================================

@pytest_asyncio.fixture(scope="function")
async def authenticated_atleta_client(client: AsyncClient, test_atleta_user: Dict[str, Any]) -> AsyncClient:
    """Return client with athlete authentication headers"""
    client.headers.update({"Authorization": f"Bearer {test_atleta_user['token']}"})
    return client


@pytest_asyncio.fixture(scope="function")
async def authenticated_entrenador_client(client: AsyncClient, test_entrenador_user: Dict[str, Any]) -> AsyncClient:
    """Return client with coach authentication headers"""
    client.headers.update({"Authorization": f"Bearer {test_entrenador_user['token']}"})
    return client


@pytest_asyncio.fixture(scope="function")
async def authenticated_admin_client(client: AsyncClient, test_admin_user: Dict[str, Any]) -> AsyncClient:
    """Return client with admin authentication headers"""
    client.headers.update({"Authorization": f"Bearer {test_admin_user['token']}"})
    return client


# ======================================================
# DATA CLEANUP HELPERS
# ======================================================

@pytest.fixture(scope="function")
def cleanup_test_data():
    """Fixture to store IDs for cleanup after tests"""
    data = {
        "user_ids": [],
        "atleta_ids": [],
        "entrenamiento_ids": [],
        "competencia_ids": []
    }
    yield data
    # Cleanup can be implemented here if needed
    # For now, tests use transactions that rollback
