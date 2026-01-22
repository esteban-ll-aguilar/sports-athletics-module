"""
Módulo de Pruebas Unitarias para el Flujo de Gestión de Sesiones.
Cubre los Casos de Prueba TC-S01 a TC-S05 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_sessions_repo, get_jwt_manager
)
from app.modules.auth.domain.schemas import SessionInfo
from datetime import datetime, timedelta, UTC
import pytest_asyncio

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_sessions_repo():
    repo = AsyncMock()
    # Mock return value for get_active_sessions_by_user
    session_mock = MagicMock()
    session_mock.id = "valid-id"
    session_mock.created_at = datetime.now(UTC)
    session_mock.expires_at = datetime.now(UTC) + timedelta(hours=1)
    session_mock.status = True
    session_mock.access_token = "access_token_123"
    session_mock.refresh_token = "refresh_token_123"
    
    repo.get_active_sessions_by_user = AsyncMock(return_value=[session_mock])
    repo.revoke_session_by_refresh_jti = AsyncMock(return_value=True)
    repo.revoke_all_user_sessions = AsyncMock(return_value=1)
    return repo

@pytest.fixture
def mock_jwt_manager():
    jwtm = AsyncMock()
    jwtm.revoke_until = AsyncMock()
    return jwtm

@pytest.fixture
def override_deps(mock_sessions_repo, mock_jwt_manager):
    _APP.dependency_overrides[get_sessions_repo] = lambda: mock_sessions_repo
    _APP.dependency_overrides[get_jwt_manager] = lambda: mock_jwt_manager
    yield
    _APP.dependency_overrides = {}

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# Mocking authentication dependency
# This requires a bit more setup usually, or checking how dependencies.py handles it.
# Assuming we can mock `get_current_user` or just simulate a valid token request if we were doing integration.
# For unit test with dependency overrides, we often need to override get_current_user too if it validates token.
from app.core.jwt.jwt import get_current_user
@pytest.fixture
def mock_user_dep():
    user = MagicMock()
    user.id = 1
    user.email = "test@test.com"
    _APP.dependency_overrides[get_current_user] = lambda: user
    return user

# --------------------------
# TC-S01: Obtener Sesiones
# --------------------------
@pytest.mark.asyncio
async def test_tc_s01_get_sessions(client: AsyncClient, override_deps, mock_user_dep, mock_sessions_repo):
    """
    TC-S01: Listado de sesiones activas.
    Expected: 200 OK, Success=True, Data contains sessions list.
    """
    response = await client.get("/api/v1/auth/sessions/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Sesiones obtenidas correctamente" in data["message"]
    assert len(data["data"]["sessions"]) == 1
    assert data["data"]["sessions"][0]["id"] == "valid-id"

# --------------------------
# TC-S02: Revocar Sesión (Asegurado/No Encontrada)
# --------------------------
@pytest.mark.asyncio
async def test_tc_s02_revoke_session_not_found(client: AsyncClient, override_deps, mock_user_dep, mock_sessions_repo):
    """
    TC-S02: Revocar sesión ajena o inexistente.
    Expected: 404 Not Found, Success=False.
    """
    payload = {"session_id": "bad-id"}
    
    response = await client.post("/api/v1/auth/sessions/revoke", json=payload)
    
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "Sesión no encontrada" in data["message"]

# --------------------------
# TC-S03: Revocar Sesión Exitoso
# --------------------------
@pytest.mark.asyncio
async def test_tc_s03_revoke_session_success(client: AsyncClient, override_deps, mock_user_dep, mock_sessions_repo, mock_jwt_manager):
    """
    TC-S03: Revocar sesión propia válida.
    Expected: 200 OK, Success=True.
    """
    payload = {"session_id": "valid-id"}
    
    response = await client.post("/api/v1/auth/sessions/revoke", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Sesión revocada exitosamente" in data["message"]
    
    # Verify calls
    mock_sessions_repo.revoke_session_by_refresh_jti.assert_called_once()
    assert mock_jwt_manager.revoke_until.call_count == 2 # access and refresh

# --------------------------
# TC-S04: Revocar Todas Exitoso
# --------------------------
@pytest.mark.asyncio
async def test_tc_s04_revoke_all_sessions(client: AsyncClient, override_deps, mock_user_dep, mock_sessions_repo, mock_jwt_manager):
    """
    TC-S04: Revocar todas las sesiones.
    Expected: 200 OK, Success=True.
    """
    response = await client.post("/api/v1/auth/sessions/revoke-all", json={})
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Se revocaron 1 sesiones" in data["message"]
    
    mock_sessions_repo.revoke_all_user_sessions.assert_called_once()
