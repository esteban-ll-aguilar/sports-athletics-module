"""
Módulo de Pruebas Unitarias para el Flujo de Registro de Usuarios.
Cubre los Casos de Prueba TC-01 a TC-14 especificados.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_users_repo, get_password_hasher, get_email_service, get_email_verification_service
)
# from app.modules.auth.domain.schemas.schemas_auth import UserRead
from app.modules.auth.domain.enums.role_enum import RoleEnum
from uuid import uuid4

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    repo.get_by_email = AsyncMock(return_value=None)
    repo.get_by_username = AsyncMock(return_value=None)
    repo.create = AsyncMock()
    repo.session = AsyncMock()
    repo.session.commit = AsyncMock()
    repo.activate_user = AsyncMock(return_value=True)
    return repo

@pytest.fixture
def mock_hasher():
    hasher = MagicMock()
    hasher.hash.return_value = "hashed_secret"
    return hasher

@pytest.fixture
def mock_email_service():
    service = MagicMock()
    service.send_email_verification_code = MagicMock()
    return service

@pytest.fixture
def mock_verification_service():
    service = AsyncMock()
    service.generate_verification_code.return_value = "123456"
    service.store_verification_code = AsyncMock()
    service.validate_verification_code = AsyncMock(return_value=True)
    service.code_exists = AsyncMock(return_value=False)
    service.get_remaining_time = AsyncMock(return_value=0)
    service.delete_verification_code = AsyncMock()
    return service

@pytest.fixture
def override_deps(mock_repo, mock_hasher, mock_email_service, mock_verification_service):
    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_password_hasher] = lambda: mock_hasher
    _APP.dependency_overrides[get_email_service] = lambda: mock_email_service
    _APP.dependency_overrides[get_email_verification_service] = lambda: mock_verification_service
    yield
    _APP.dependency_overrides = {}

import pytest_asyncio

from httpx import ASGITransport
@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    """Cliente HTTP asíncrono scoped a function para evitar problemas de loop."""
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# --------------------------
# TC-01: Crear usuario válido
# --------------------------
def _create_mock_user(data: dict):
    """Helper para crear un mock user que pase la validación de UserRead."""
    mock = MagicMock()
    mock.id = 1
    mock.external_id = uuid4()
    mock.email = data.get("email")
    mock.username = data.get("username")
    mock.password_hash = "hashed"
    mock.is_active = False # Default inactive
    mock.role = RoleEnum(data.get("role", RoleEnum.ATLETA))
    
    # Optional fields defaults to None to avoid MagicMock objects triggering Pydantic validation errors
    mock.first_name = data.get("first_name")
    mock.last_name = data.get("last_name")
    mock.tipo_identificacion = data.get("tipo_identificacion")
    mock.identificacion = data.get("identificacion")
    mock.tipo_estamento = data.get("tipo_estamento")
    mock.phone = data.get("phone")
    mock.direccion = data.get("direccion")
    mock.profile_image = None
    mock.fecha_nacimiento = None
    mock.sexo = None
    
    return mock

# --------------------------
# TC-01: Crear usuario válido
# --------------------------
@pytest.mark.asyncio
async def test_tc_01_crear_usuario_valido(client: AsyncClient, override_deps, mock_repo):
    """
    TC-01: Crear usuario con todos los datos correctos.
    Expected: 201 Created.
    """
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "tipo_identificacion": "CEDULA",
        "identificacion": "1710034065",
        "phone": "0999999999",
        "tipo_estamento": "EXTERNOS",
        "role": "ATLETA"
    }
    
    mock_user = _create_mock_user(payload)
    mock_repo.create.return_value = mock_user

    response = await client.post("/api/v1/auth/register", json=payload)
    
    # DEBUG: Print response text if status code is not 201
    if response.status_code != 201:
        print(f"\nDEBUG: TC-01 Failed with {response.status_code}. Response: {response.text}")

    assert response.status_code == 201
    data = response.json()
    # Handle APIResponse wrapper if present
    user_data = data["data"] if "data" in data else data
    
    assert user_data["email"] == "juan@test.com"
    assert user_data["is_active"] is False
    mock_repo.create.assert_called_once()

# --------------------------
# TC-02: Validar cédula ecuatoriana
# --------------------------
@pytest.mark.asyncio
async def test_tc_02_validar_cedula_invalida(client: AsyncClient, override_deps):
    """
    TC-02: Rechazar cédula inválida (algoritmo).
    Expected: 422 Unprocessable Entity o 400 Bad Request si existiera validación.
    Nota: Si no hay validador implementado, esto podría fallar (pasar como 201).
    """
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "tipo_identificacion": "CEDULA",
        "identificacion": "1234567890", # Invalid cedula logicamente
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    
    # IMPORTANTE: Si la API no valida algoritmo de cedula, esto devolverá 201.
    # El test asume que DEBERIA fallar.
    # Si devuelve 201, el test fallará, indicando que falta la validación.
    assert response.status_code == 422

# --------------------------
# TC-03: Validar contraseña fuerte (Sin Mayuscula)
# --------------------------
@pytest.mark.asyncio
async def test_tc_03_password_sin_mayuscula(client: AsyncClient, override_deps):
    """TC-03: Rechazar contraseña sin mayúscula."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "abc123$%", # Falta mayuscula
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    # assert "mayúscula" in response.text

# --------------------------
# TC-04: Validar contraseña fuerte (Sin Numero)
# --------------------------
@pytest.mark.asyncio
async def test_tc_04_password_sin_numero(client: AsyncClient, override_deps):
    """TC-04: Rechazar contraseña sin número."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abcdef$%", # Falta numero
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    # assert "número" in response.text

# --------------------------
# TC-05: Validar contraseña fuerte (Sin Caracter Especial)
# --------------------------
@pytest.mark.asyncio
async def test_tc_05_password_sin_especial(client: AsyncClient, override_deps):
    """TC-05: Rechazar contraseña sin carácter especial."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc12345", # Falta especial
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    # assert "carácter especial" in response.text

# --------------------------
# TC-06: Validar rol permitido (Admin no permitido)
# --------------------------
@pytest.mark.asyncio
async def test_tc_06_rol_invalido(client: AsyncClient, override_deps):
    """TC-06: Rechazar rol no permitido (ADMINISTRADOR)."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "role": "ADMINISTRADOR" # No permitido
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    # assert "rol" in response.text

# --------------------------
# TC-07: Crear usuario con rol válido (ATLETA)
# --------------------------
@pytest.mark.asyncio
async def test_tc_07_rol_valido_atleta(client: AsyncClient, override_deps, mock_repo):
    """TC-07: Crear usuario con rol ATLETA es permitido."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "EXTERNOS",
        "role": "ATLETA"
    }
    
    mock_user = _create_mock_user(payload)
    mock_repo.create.return_value = mock_user

    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

# --------------------------
# TC-08: Envío de código de activación
# --------------------------
@pytest.mark.asyncio
async def test_tc_08_envio_codigo_activacion(client: AsyncClient, override_deps, mock_repo, mock_email_service):
    """TC-08: Verificar que se envía el código por correo al registrar."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "EXTERNOS",
        "role": "ATLETA"
    }
    
    mock_user = _create_mock_user(payload)
    mock_repo.create.return_value = mock_user

    await client.post("/api/v1/auth/register", json=payload)
    
    # Verificar llamada al servicio de email
    mock_email_service.send_email_verification_code.assert_called_once()
    # Verificar argumentos (email correcto)
    args, _ = mock_email_service.send_email_verification_code.call_args
    assert args[0] == "juan@test.com"

# --------------------------
# TC-09: Activar usuario con código correcto
# --------------------------
@pytest.mark.asyncio
async def test_tc_09_activar_usuario_ok(client: AsyncClient, override_deps, mock_verification_service):
    """TC-09: Activar usuario con código correcto."""
    payload = {
        "email": "juan@test.com",
        "code": "123456" 
    }
    mock_verification_service.validate_verification_code.return_value = True
    
    response = await client.post("/api/v1/auth/email/verify", json=payload)
    
    assert response.status_code == 200
    assert "verificado exitosamente" in response.json()["message"]

# --------------------------
# TC-10: Activar usuario con código incorrecto
# --------------------------
@pytest.mark.asyncio
async def test_tc_10_activar_usuario_fail(client: AsyncClient, override_deps, mock_verification_service):
    """TC-10: Rechazar activación con código incorrecto."""
    payload = {
        "email": "juan@test.com",
        "code": "999999" 
    }
    mock_verification_service.validate_verification_code.return_value = False
    
    response = await client.post("/api/v1/auth/email/verify", json=payload)
    
    assert response.status_code == 400
    assert "Código inválido" in response.json()["message"]

# --------------------------
# TC-11: Validar email duplicado
# --------------------------
@pytest.mark.asyncio
async def test_tc_11_email_duplicado(client: AsyncClient, override_deps, mock_repo):
    """TC-11: Evitar registro con email existente."""
    mock_repo.get_by_email.return_value = MagicMock() # Simular usuario existe
    
    payload = {
        "username": "juan123",
        "email": "duplicado@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "1710034065",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "EXTERNOS",
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    
    assert response.status_code == 409
    assert "Email ya registrado" in response.json()["message"]

# --------------------------
# TC-12: Validar username duplicado
# --------------------------
@pytest.mark.asyncio
async def test_tc_12_username_duplicado(client: AsyncClient, override_deps, mock_repo):
    """
    TC-12: Evitar registro con username existente.
    Nota: El código actual de auth.py NO parece validar username duplicado explícitamente.
    Este test falla si devuelve 201.
    """
    mock_repo.get_by_email.return_value = None # Email libre
    mock_repo.get_by_username.return_value = MagicMock() # Username duplicado
    
    # OJO: auth.py solo chequea email. Username suele ser unique en DB.
    # Si dependemos de la DB, repository.create lanzaría excepcion.
    # Como el repo es mock, debemos simular que el repo chequea username o que create falla.
    # Si la logica DEBE estar en router, entonces aqui fallará.
    # Simulamos que create lanza error si fuera DB real?
    # O verificamos si el router llama a get_by_username? (No lo hace).
    
    payload = {
        "username": "duplicado123",
        "email": "nuevo@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "1710034065",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "EXTERNOS",
        "role": "ATLETA"
    }
    
    # Asumamos que el requerimiento es que el sistema lo rechace.
    # Si el router no lo chequea, pasará al create.
    # Para este test, si queremos ver si el ROUTER tiene la logsica:
    
    response = await client.post("/api/v1/auth/register", json=payload)
    
    # Si el router no valida, esto será 201 y el test alertará la falta de validación.
    assert response.status_code == 409 

# --------------------------
# TC-13: Campos opcionales (sin fecha nacimiento)
# --------------------------
@pytest.mark.asyncio
async def test_tc_13_campos_opcionales(client: AsyncClient, override_deps, mock_repo):
    """TC-13: Crear usuario sin fecha_nacimiento (es opcional)."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "last_name": "Perez",
        "identificacion": "0705743177",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "EXTERNOS",
        # fecha_nacimiento ausente
        "role": "ATLETA"
    }
    
    mock_user = _create_mock_user(payload)
    mock_repo.create.return_value = mock_user

    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201

# --------------------------
# TC-14: Validar teléfono (muy corto)
# --------------------------
@pytest.mark.asyncio
async def test_tc_14_telefono_corto(client: AsyncClient, override_deps):
    """TC-14: Rechazar teléfono muy corto."""
    payload = {
        "username": "juan123",
        "email": "juan@test.com",
        "password": "Abc123$%",
        "first_name": "Juan",
        "identificacion": "0705743177",
        "phone": "12345", # Muy corto
        "role": "ATLETA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    # assert "phone" in response.text
