"""
Módulo de Pruebas Unitarias para el Flujo de Verificación de Email.
Cubre los Casos de Prueba TC-E01 a TC-E06 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_users_repo, get_email_service, get_email_verification_service
)
from fastapi import status
import pytest_asyncio

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get_by_email = AsyncMock(return_value=None)
    repo.activate_user = AsyncMock(return_value=True)
    return repo

@pytest.fixture
def mock_email_service():
    service = MagicMock()
    service.send_email_verification_code = MagicMock()
    return service

@pytest.fixture
def mock_verification_service():
    service = AsyncMock()
    service.validate_verification_code = AsyncMock(return_value=True)
    service.code_exists = AsyncMock(return_value=False)
    service.get_remaining_time = AsyncMock(return_value=0)
    service.generate_verification_code = MagicMock(return_value="123456")
    service.store_verification_code = AsyncMock()
    service.delete_verification_code = AsyncMock()
    return service

@pytest.fixture
def override_deps(mock_repo, mock_email_service, mock_verification_service):
    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_email_service] = lambda: mock_email_service
    _APP.dependency_overrides[get_email_verification_service] = lambda: mock_verification_service
    yield
    _APP.dependency_overrides = {}

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# --------------------------
# TC-E01: Verificación Exitosa
# --------------------------
@pytest.mark.asyncio
async def test_tc_e01_verificacion_exitosa(client: AsyncClient, override_deps, mock_verification_service, mock_repo):
    """
    TC-E01: Usuario ingresa código correcto.
    Expected: 200 OK, Success=True.
    """
    payload = {"email": "juan@test.com", "code": "123456"}
    
    mock_verification_service.validate_verification_code.return_value = True
    mock_repo.activate_user.return_value = True

    response = await client.post("/api/v1/auth/email/verify", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "exitosa" in data["message"]
    mock_repo.activate_user.assert_called_once_with("juan@test.com")

# --------------------------
# TC-E02: Código Inválido
# --------------------------
@pytest.mark.asyncio
async def test_tc_e02_codigo_invalido(client: AsyncClient, override_deps, mock_verification_service):
    """
    TC-E02: Usuario ingresa código incorrecto.
    Expected: 400 Bad Request.
    """
    payload = {"email": "juan@test.com", "code": "999999"}
    
    mock_verification_service.validate_verification_code.return_value = False

    response = await client.post("/api/v1/auth/email/verify", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "inválido" in data["message"]

# --------------------------
# TC-E03: Usuario No Encontrado
# --------------------------
@pytest.mark.asyncio
async def test_tc_e03_usuario_no_encontrado(client: AsyncClient, override_deps, mock_verification_service, mock_repo):
    """
    TC-E03: Verificación para email inexistente.
    Expected: 404 Not Found.
    """
    payload = {"email": "unknown@test.com", "code": "123456"}
    
    # Validation passes (code is correct technically) but user not found in DB
    mock_verification_service.validate_verification_code.return_value = True
    mock_repo.activate_user.return_value = False # User not found or failed to activate

    response = await client.post("/api/v1/auth/email/verify", json=payload)
    
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "Usuario no encontrado" in data["message"]

# --------------------------
# TC-E04: Reenvío Exitoso
# --------------------------
@pytest.mark.asyncio
async def test_tc_e04_reenvio_exitoso(client: AsyncClient, override_deps, mock_repo, mock_email_service, mock_verification_service):
    """
    TC-E04: Solicitud de nuevo código (Reenvío).
    Expected: 200 OK, Success=True.
    """
    payload = {"email": "juan@test.com"}
    
    # Mock user exists and is inactive
    mock_user = MagicMock()
    mock_user.is_active = False
    mock_repo.get_by_email.return_value = mock_user
    
    mock_verification_service.code_exists.return_value = False

    response = await client.post("/api/v1/auth/email/resend-verification", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "enviado" in data["message"]
    mock_email_service.send_email_verification_code.assert_called_once()

# --------------------------
# TC-E05: Rate Limit / Código Activo
# --------------------------
@pytest.mark.asyncio
async def test_tc_e05_rate_limit(client: AsyncClient, override_deps, mock_repo, mock_verification_service):
    """
    TC-E05: Ya existe un código activo (Rate Limit).
    Expected: 429 Too Many Requests.
    """
    payload = {"email": "juan@test.com"}
    
    mock_user = MagicMock()
    mock_user.is_active = False
    mock_repo.get_by_email.return_value = mock_user
    
    mock_verification_service.code_exists.return_value = True
    mock_verification_service.get_remaining_time.return_value = 120 # 2 mins

    response = await client.post("/api/v1/auth/email/resend-verification", json=payload)
    
    assert response.status_code == 429
    data = response.json()
    assert data["success"] is False
    assert "Ya existe un código activo" in data["message"]

# --------------------------
# TC-E06: Cuenta Ya Verificada
# --------------------------
@pytest.mark.asyncio
async def test_tc_e06_ya_verificado(client: AsyncClient, override_deps, mock_repo):
    """
    TC-E06: Cuenta ya verificada.
    Expected: 400 Bad Request.
    """
    payload = {"email": "active@test.com"}
    
    mock_user = MagicMock()
    mock_user.is_active = True
    mock_repo.get_by_email.return_value = mock_user
    
    response = await client.post("/api/v1/auth/email/resend-verification", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "ya está verificada" in data["message"]
