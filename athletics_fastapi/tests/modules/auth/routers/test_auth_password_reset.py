"""
Módulo de Pruebas Unitarias para el Flujo de Reset de Contraseña.
Cubre los Casos de Prueba TC-P01 a TC-P08 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_users_repo, get_password_hasher, get_email_service, get_password_reset_service
)
import pytest_asyncio

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get_by_email = AsyncMock(return_value=None)
    repo.update_password_by_email = AsyncMock(return_value=True)
    return repo

@pytest.fixture
def mock_hasher():
    hasher = MagicMock()
    hasher.hash = MagicMock(return_value="hashed_secret")
    return hasher

@pytest.fixture
def mock_email_service():
    service = MagicMock()
    service.send_reset_code = MagicMock()
    service.send_password_changed_confirmation = MagicMock()
    return service

@pytest.fixture
def mock_reset_service():
    service = AsyncMock()
    service.generate_reset_code = MagicMock(return_value="123456")
    service.code_exists = AsyncMock(return_value=False)
    service.store_reset_code = AsyncMock()
    service.delete_reset_code = AsyncMock()
    service.validate_reset_code_only = AsyncMock(return_value=True)
    service.consume_reset_code = AsyncMock(return_value=True)
    return service

@pytest.fixture
def override_deps(mock_repo, mock_hasher, mock_email_service, mock_reset_service):
    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_password_hasher] = lambda: mock_hasher
    _APP.dependency_overrides[get_email_service] = lambda: mock_email_service
    _APP.dependency_overrides[get_password_reset_service] = lambda: mock_reset_service
    yield
    _APP.dependency_overrides = {}

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# --------------------------
# TC-P01: Solicitar Reset (Email Existe)
# --------------------------
@pytest.mark.asyncio
async def test_tc_p01_solicitar_reset_exitoso(client: AsyncClient, override_deps, mock_repo, mock_email_service, mock_reset_service):
    """
    TC-P01: Usuario existe.
    Expected: 200 OK, Success=True, Message generic.
    """
    payload = {"email": "juan@test.com"}
    mock_repo.get_by_email.return_value = MagicMock() # User exists
    mock_reset_service.code_exists.return_value = False

    response = await client.post("/api/v1/auth/password-reset/request", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Si el email existe" in data["message"]
    mock_email_service.send_reset_code.assert_called_once()

# --------------------------
# TC-P02: Solicitar Reset (Email No Existe)
# --------------------------
@pytest.mark.asyncio
async def test_tc_p02_solicitar_reset_no_existe(client: AsyncClient, override_deps, mock_repo, mock_email_service):
    """
    TC-P02: Usuario no existe.
    Expected: 200 OK, Success=True, Message generic (Security).
    """
    payload = {"email": "unknown@test.com"}
    mock_repo.get_by_email.return_value = None # User does not exist

    response = await client.post("/api/v1/auth/password-reset/request", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Si el email existe" in data["message"]
    mock_email_service.send_reset_code.assert_not_called()

# --------------------------
# TC-P03: Solicitar Reset (Rate Limit)
# --------------------------
@pytest.mark.asyncio
async def test_tc_p03_solicitar_reset_rate_limit(client: AsyncClient, override_deps, mock_repo, mock_reset_service):
    """
    TC-P03: Código activo existente.
    Expected: 429 Too Many Requests.
    """
    payload = {"email": "juan@test.com"}
    mock_repo.get_by_email.return_value = MagicMock()
    mock_reset_service.code_exists.return_value = True

    response = await client.post("/api/v1/auth/password-reset/request", json=payload)
    
    assert response.status_code == 429
    data = response.json()
    assert data["success"] is False
    assert "Ya existe un código activo" in data["message"]

# --------------------------
# TC-P04: Validar Código Correcto
# --------------------------
@pytest.mark.asyncio
async def test_tc_p04_validar_codigo_correcto(client: AsyncClient, override_deps, mock_reset_service):
    """
    TC-P04: Código válido.
    Expected: 200 OK, Success=True.
    """
    payload = {"email": "juan@test.com", "code": "VALIDO"}
    mock_reset_service.validate_reset_code_only.return_value = True

    response = await client.post("/api/v1/auth/password-reset/validate-code", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Código válido" in data["message"]

# --------------------------
# TC-P05: Validar Código Incorrecto
# --------------------------
@pytest.mark.asyncio
async def test_tc_p05_validar_codigo_incorrecto(client: AsyncClient, override_deps, mock_reset_service):
    """
    TC-P05: Código inválido.
    Expected: 400 Bad Request.
    """
    payload = {"email": "juan@test.com", "code": "MALO"}
    mock_reset_service.validate_reset_code_only.return_value = False

    response = await client.post("/api/v1/auth/password-reset/validate-code", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "inválido" in data["message"]

# --------------------------
# TC-P06: Completar Reset Exitoso
# --------------------------
@pytest.mark.asyncio
async def test_tc_p06_completar_reset_exitoso(client: AsyncClient, override_deps, mock_repo, mock_reset_service, mock_email_service):
    """
    TC-P06: Reset exitoso.
    Expected: 200 OK, Success=True.
    """
    payload = {"email": "juan@test.com", "code": "VALIDO", "new_password": "NewPass123!"}
    mock_repo.get_by_email.return_value = MagicMock()
    mock_reset_service.consume_reset_code.return_value = True
    mock_repo.update_password_by_email.return_value = True

    response = await client.post("/api/v1/auth/password-reset/reset", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Contraseña restablecida exitosamente" in data["message"]
    mock_email_service.send_password_changed_confirmation.assert_called_once()

# --------------------------
# TC-P07: Completar Reset (Código Expirado/Usado)
# --------------------------
@pytest.mark.asyncio
async def test_tc_p07_completar_reset_codigo_invalido(client: AsyncClient, override_deps, mock_repo, mock_reset_service):
    """
    TC-P07: Código inválido o expirado al consumir.
    Expected: 400 Bad Request.
    """
    payload = {"email": "juan@test.com", "code": "USED", "new_password": "NewPass123!"}
    mock_repo.get_by_email.return_value = MagicMock()
    mock_reset_service.consume_reset_code.return_value = False # Validation failed at consume step

    response = await client.post("/api/v1/auth/password-reset/reset", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Código inválido" in data["message"]

# --------------------------
# TC-P08: Usuario No Encontrado (Final)
# --------------------------
@pytest.mark.asyncio
async def test_tc_p08_completar_reset_usuario_no_encontrado(client: AsyncClient, override_deps, mock_repo):
    """
    TC-P08: Usuario borrado después de solicitar.
    Expected: 404 Not Found.
    """
    payload = {"email": "deleted@test.com", "code": "VALIDO", "new_password": "NewPass123!"}
    mock_repo.get_by_email.return_value = None

    response = await client.post("/api/v1/auth/password-reset/reset", json=payload)
    
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "Usuario no encontrado" in data["message"]
