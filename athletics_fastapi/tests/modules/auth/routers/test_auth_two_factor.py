"""
Módulo de Pruebas Unitarias para 2FA.
Cubre los Casos de Prueba TC-2FA-01 a TC-2FA-09 especificados en AUTH.README.md.
Nota: TC-2FA-10 a TC-2FA-15 (login flows) requieren integración con login previo.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_users_repo, get_two_factor_service, get_password_hasher
)
import pytest_asyncio

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_users_repo():
    repo = AsyncMock()
    user_mock = MagicMock()
    user_mock.id = 1
    user_mock.email = "test@test.com"
    user_mock.two_factor_enabled = False
    user_mock.totp_secret = None
    user_mock.totp_backup_codes = None
    user_mock.hashed_password = "hashed_password"
    
    repo.get_by_id = AsyncMock(return_value=user_mock)
    repo.db = MagicMock()
    repo.db.commit = AsyncMock()
    return repo, user_mock

@pytest.fixture
def mock_twofa_service():
    service = MagicMock()
    service.generate_secret = MagicMock(return_value="JBSWY3DPEHPK3PXP")
    service.generate_qr_code = MagicMock(return_value="data:image/png;base64,...")
    service.get_backup_codes = MagicMock(return_value=["ABCD-1234", "EFGH-5678", "IJKL-9012", "MNOP-3456", "QRST-7890"])
    service.hash_backup_codes = MagicMock(return_value='["hashed1", "hashed2"]')
    service.verify_totp_code = MagicMock(return_value=True)
    return service

@pytest.fixture
def mock_hasher():
    hasher = MagicMock()
    hasher.verify = MagicMock(return_value=True) # Password verify by default
    return hasher

@pytest.fixture
def override_deps(mock_users_repo, mock_twofa_service, mock_hasher):
    repo, user = mock_users_repo
    _APP.dependency_overrides[get_users_repo] = lambda: repo
    _APP.dependency_overrides[get_two_factor_service] = lambda: mock_twofa_service
    _APP.dependency_overrides[get_password_hasher] = lambda: mock_hasher
    yield repo, user, mock_twofa_service, mock_hasher
    _APP.dependency_overrides = {}

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

from app.core.jwt.jwt import get_current_user
@pytest.fixture
def mock_current_user(mock_users_repo):
    _, user = mock_users_repo
    _APP.dependency_overrides[get_current_user] = lambda: user
    return user

# --------------------------
# TC-2FA-01: Habilitar 2FA (Éxito)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_01_enable_success(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-01: Usuario sin 2FA solicita activación.
    Expected: 200 OK, Success=True, data con secret, qr_code, backup_codes.
    """
    response = await client.post("/api/v1/auth/2fa/enable", json={})
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "secret" in data["data"]
    assert "qr_code" in data["data"]
    assert "backup_codes" in data["data"]
    assert len(data["data"]["backup_codes"]) == 5

# --------------------------
# TC-2FA-02: Habilitar 2FA (Ya Activo)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_02_enable_already_active(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-02: Usuario con 2FA activo intenta activar.
    Expected: 400 Bad Request, Success=False.
    """
    _, user, _, _ = override_deps
    user.two_factor_enabled = True
    
    response = await client.post("/api/v1/auth/2fa/enable", json={})
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "2FA ya está habilitado" in data["message"]

# --------------------------
# TC-2FA-03: Verificar y Activar (Éxito)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_03_verify_success(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-03: Usuario verifica código TOTP.
    Expected: 200 OK, Success=True.
    """
    _, user, twofa_service, _ = override_deps
    user.totp_secret = "JBSWY3DPEHPK3PXP" # Setup initiated
    twofa_service.verify_totp_code.return_value = True
    
    payload = {"code": "123456"}
    response = await client.post("/api/v1/auth/2fa/verify", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "2FA activado exitosamente" in data["message"]

# --------------------------
# TC-2FA-04: Verificar y Activar (Código Inválido)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_04_verify_invalid_code(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-04: Usuario ingresa código incorrecto.
    Expected: 400 Bad Request, Success=False.
    """
    _, user, twofa_service, _ = override_deps
    user.totp_secret = "JBSWY3DPEHPK3PXP"
    twofa_service.verify_totp_code.return_value = False
    
    payload = {"code": "999999"}
    response = await client.post("/api/v1/auth/2fa/verify", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Código inválido" in data["message"]

# --------------------------
# TC-2FA-05: Verificar y Activar (Sin Setup Previo)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_05_verify_no_setup(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-05: Usuario intenta verificar sin /enable.
    Expected: 400 Bad Request.
    """
    payload = {"code": "123456"}
    response = await client.post("/api/v1/auth/2fa/verify", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Primero debes iniciar el proceso" in data["message"]

# --------------------------
# TC-2FA-06: Deshabilitar 2FA (Éxito)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_06_disable_success(client: AsyncClient, override_deps, mock_current_user, mock_hasher):
    """
    TC-2FA-06: Usuario válido deshabilita.
    Expected: 200 OK, Success=True.
    """
    _, user, twofa_service, _ = override_deps
    user.two_factor_enabled = True
    user.totp_secret = "JBSWY3DPEHPK3PXP"
    mock_hasher.verify.return_value = True
    twofa_service.verify_totp_code.return_value = True
    
    payload = {"password": "Abc123!", "code": "123456"}
    response = await client.post("/api/v1/auth/2fa/disable", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "2FA deshabilitado exitosamente" in data["message"]

# --------------------------
# TC-2FA-07: Deshabilitar 2FA (Password Incorrecto)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_07_disable_wrong_password(client: AsyncClient, override_deps, mock_current_user, mock_hasher):
    """
    TC-2FA-07: Password erróneo.
    Expected: 401 Unauthorized.
    """
    _, user, _, _ = override_deps
    user.two_factor_enabled = True
    user.totp_secret = "JBSWY3DPEHPK3PXP"
    mock_hasher.verify.return_value = False # Wrong password
    
    payload = {"password": "WrongPass", "code": "123456"}
    response = await client.post("/api/v1/auth/2fa/disable", json=payload)
    
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert "Contraseña incorrecta" in data["message"]

# --------------------------
# TC-2FA-08: Deshabilitar 2FA (Código Incorrecto)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_08_disable_wrong_code(client: AsyncClient, override_deps, mock_current_user, mock_hasher):
    """
    TC-2FA-08: Código TOTP incorrecto.
    Expected: 400 Bad Request.
    """
    _, user, twofa_service, _ = override_deps
    user.two_factor_enabled = True
    user.totp_secret = "JBSWY3DPEHPK3PXP"
    mock_hasher.verify.return_value = True
    twofa_service.verify_totp_code.return_value = False
    
    payload = {"password": "Abc123!", "code": "999999"}
    response = await client.post("/api/v1/auth/2fa/disable", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Código TOTP inválido" in data["message"]

# --------------------------
# TC-2FA-09: Deshabilitar 2FA (NO Activo)
# --------------------------
@pytest.mark.asyncio
async def test_tc_2fa_09_disable_not_enabled(client: AsyncClient, override_deps, mock_current_user):
    """
    TC-2FA-09: Usuario intenta deshabilitar sin tener 2FA.
    Expected: 400 Bad Request.
    """
    payload = {"password": "Abc123!", "code": "123456"}
    response = await client.post("/api/v1/auth/2fa/disable", json=payload)
    
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "2FA no está habilitado" in data["message"]
