"""
Módulo de Pruebas Unitarias para el Flujo de Inicio de Sesión.
Cubre los Casos de Prueba TC-L01 a TC-L05 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_users_repo, get_password_hasher, get_jwt_manager, get_sessions_repo
)
from uuid import uuid4

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get_by_email = AsyncMock(return_value=None)
    # repo.session = AsyncMock() # No se usa directamente en login normalmente si se usa repo methods
    return repo

@pytest.fixture
def mock_sessions_repo():
    repo = AsyncMock()
    repo.create_or_update_session = AsyncMock()
    return repo

@pytest.fixture
def mock_hasher():
    hasher = MagicMock()
    hasher.verify.return_value = True # Default pass
    return hasher

@pytest.fixture
def mock_jwtm():
    jwtm = MagicMock()
    jwtm.create_access_token.return_value = "access_token_mock"
    jwtm.create_refresh_token.return_value = "refresh_token_mock"
    jwtm.decode.return_value = {"jti": "mock_jti", "exp": 1234567890}
    jwtm.store_refresh = AsyncMock()
    return jwtm

@pytest.fixture
def override_deps(mock_repo, mock_sessions_repo, mock_hasher, mock_jwtm):
    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_sessions_repo] = lambda: mock_sessions_repo
    _APP.dependency_overrides[get_password_hasher] = lambda: mock_hasher
    _APP.dependency_overrides[get_jwt_manager] = lambda: mock_jwtm
    yield
    _APP.dependency_overrides = {}

from httpx import ASGITransport
import pytest_asyncio

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

def _create_mock_user(active=True, two_factor=False):
    mock = MagicMock()
    mock.id = 1
    mock.external_id = uuid4()
    mock.email = "juan@test.com"
    mock.hashed_password = "hashed_pw"
    mock.is_active = active
    mock.two_factor_enabled = two_factor
    mock.profile.role.name = "ATLETA"
    mock.profile.username = "juan123"
    return mock

# --------------------------
# TC-L01: Login Exitoso
# --------------------------
@pytest.mark.asyncio
async def test_tc_l01_login_exitoso(client: AsyncClient, override_deps, mock_repo, mock_hasher):
    """TC-L01: Login Exitoso."""
    user = _create_mock_user()
    mock_repo.get_by_email.return_value = user
    mock_hasher.verify.return_value = True

    payload = {"username": "juan@test.com", "password": "Abc123$%"}
    response = await client.post("/api/v1/auth/login", data=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]

# --------------------------
# TC-L02: Credenciales Inválidas (Password)
# --------------------------
@pytest.mark.asyncio
async def test_tc_l02_password_incorrecto(client: AsyncClient, override_deps, mock_repo, mock_hasher):
    """TC-L02: Password incorrecto."""
    user = _create_mock_user()
    mock_repo.get_by_email.return_value = user
    mock_hasher.verify.return_value = False # Password incorrecto

    payload = {"username": "juan@test.com", "password": "WrongPassword"}
    response = await client.post("/api/v1/auth/login", data=payload)

    assert response.status_code == 401
    assert response.json()["message"] == "Credenciales inválidas"

# --------------------------
# TC-L03: Credenciales Inválidas (Usuario)
# --------------------------
@pytest.mark.asyncio
async def test_tc_l03_usuario_inexistente(client: AsyncClient, override_deps, mock_repo):
    """TC-L03: Usuario no existe."""
    mock_repo.get_by_email.return_value = None

    payload = {"username": "noexiste@test.com", "password": "Abc123$%"}
    response = await client.post("/api/v1/auth/login", data=payload)

    assert response.status_code == 401
    assert response.json()["message"] == "Credenciales inválidas"

# --------------------------
# TC-L04: Usuario Inactivo
# --------------------------
@pytest.mark.asyncio
async def test_tc_l04_usuario_inactivo(client: AsyncClient, override_deps, mock_repo, mock_hasher):
    """TC-L04: Usuario inactivo."""
    user = _create_mock_user(active=False)
    mock_repo.get_by_email.return_value = user
    mock_hasher.verify.return_value = True

    payload = {"username": "inactive@test.com", "password": "Abc123$%"}
    response = await client.post("/api/v1/auth/login", data=payload)

    assert response.status_code == 401
    assert "inactivo" in response.json()["message"]

# --------------------------
# TC-L05: 2FA Requerido
# --------------------------
@pytest.mark.asyncio
async def test_tc_l05_2fa_requerido(client: AsyncClient, override_deps, mock_repo, mock_hasher):
    """TC-L05: 2FA Requerido."""
    user = _create_mock_user(two_factor=True)
    mock_repo.get_by_email.return_value = user
    mock_hasher.verify.return_value = True

    payload = {"username": "2fa@test.com", "password": "Abc123$%"}
    response = await client.post("/api/v1/auth/login", data=payload)

    # El status OK 200 sigue siendo válido porque devuelve una respuesta exitosa (aunque parcial)
    # o un status específico si se diseñó así. Revisando auth.py, retorna TokenPair o TwoFactorRequired
    # envuelto en APIResponse con status default (200).
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "temp_token" in data["data"]
    assert data["message"] == "2FA requerido"
