"""
Módulo de Pruebas Unitarias para el Flujo de Refresh Token.
Cubre los Casos de Prueba TC-R01 a TC-R03 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_sessions_repo, get_jwt_manager
)

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_sessions_repo():
    repo = AsyncMock()
    repo.update_session_access_token = AsyncMock()
    return repo

@pytest.fixture
def mock_jwtm():
    jwtm = MagicMock()
    jwtm.create_access_token.return_value = "new_access_token"
    jwtm.create_refresh_token.return_value = "new_refresh_token"
    jwtm.decode.return_value = {
        "jti": "old_jti", 
        "sub": "user_id", 
        "exp": 1234567890,
        "type": "refresh",
        "role": "ATLETA",
        "email": "test@test.com",
        "name": "User"
    }
    jwtm.consume_refresh = AsyncMock(return_value="user_id") # Retorna sub si es valido
    jwtm.store_refresh = AsyncMock()
    return jwtm

@pytest.fixture
def override_deps(mock_sessions_repo, mock_jwtm):
    _APP.dependency_overrides[get_sessions_repo] = lambda: mock_sessions_repo
    _APP.dependency_overrides[get_jwt_manager] = lambda: mock_jwtm
    yield
    _APP.dependency_overrides = {}

from httpx import ASGITransport
import pytest_asyncio

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# --------------------------
# TC-R01: Renovación Exitosa
# --------------------------
@pytest.mark.asyncio
async def test_tc_r01_renovacion_exitosa(client: AsyncClient, override_deps, mock_jwtm):
    """TC-R01: Renovación exitosa."""
    payload = {"refresh_token": "valid_token"}
    response = await client.post("/api/v1/auth/refresh", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["access_token"] == "new_access_token"
    assert data["data"]["refresh_token"] == "new_refresh_token"

# --------------------------
# TC-R02: Token Inválido (Tipo incorrecto/Expirado/Firma)
# --------------------------
@pytest.mark.asyncio
async def test_tc_r02_token_invalido_estructura(client: AsyncClient, override_deps, mock_jwtm):
    """TC-R02: Token inválido (por ejemplo, access token en lugar de refresh)."""
    # Simular que decode devuelve un token que no es de tipo refresh
    mock_jwtm.decode.return_value = {"type": "access", "sub": "1"} # Wrong type

    payload = {"refresh_token": "invalid_type_token"}
    response = await client.post("/api/v1/auth/refresh", json=payload)

    assert response.status_code == 400
    assert "Token inválido" in response.json()["detail"]

# --------------------------
# TC-R03: Refresh Reusado/Inválido (Logica de consumo)
# --------------------------
@pytest.mark.asyncio
async def test_tc_r03_refresh_consumido(client: AsyncClient, override_deps, mock_jwtm):
    """TC-R03: Token reusado o no encontrado en backend state."""
    # Simular que consume_refresh devuelve None (no matchea o ya consumido)
    mock_jwtm.consume_refresh.return_value = None 

    payload = {"refresh_token": "consumed_token"}
    response = await client.post("/api/v1/auth/refresh", json=payload)

    assert response.status_code == 401
    assert "Refresh inválido" in response.json()["detail"]
