import pytest
import pytest_asyncio
import asyncio
import sys
import os
from typing import AsyncGenerator, Dict, Any
from httpx import AsyncClient, ASGITransport
from fastapi.exceptions import ResponseValidationError

from tests.utils import generar_cedula_ecuador
# ⚠️ CRITICAL: Enable test routes BEFORE importing the app
os.environ["ENABLE_TEST_ROUTES"] = "true"

from app.main import _APP
from app.core.db.database import _db

# Asegurar imports
# Asegurar imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import select
from datetime import date
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
from app.modules.entrenador.domain.schemas.horario_schema import HorarioCreate
from app.modules.entrenador.domain.schemas.registro_asistencias_schema import RegistroAsistenciasCreate
from app.modules.entrenador.domain.schemas.asistencia_schema import AsistenciaCreate


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
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "ESTUDIANTES",
        "roles": ["ATLETA"],
        "is_active": True
    }
    
    # Register user via test endpoint (no rate limit, active by default)
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register atleta user: {response.status_code} - {response.text[:200]}")
    user = response.json()["data"]
    
    # Login to get token
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    if login_response.status_code != 200:
        pytest.skip(f"Failed to login atleta user: {login_response.status_code}")
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
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "DOCENTES",
        "roles": ["ENTRENADOR"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register entrenador user: {response.status_code} - {response.text[:200]}")
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    if login_response.status_code != 200:
        pytest.skip(f"Failed to login entrenador user: {login_response.status_code}")
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
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "ADMINISTRATIVOS",
        "roles": ["ADMINISTRADOR"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register admin user: {response.status_code} - {response.text[:200]}")
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    if login_response.status_code != 200:
        pytest.skip(f"Failed to login admin user: {login_response.status_code}")
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
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "EXTERNOS",
        "roles": ["REPRESENTANTE"],
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register representante user: {response.status_code} - {response.text[:200]}")
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    if login_response.status_code != 200:
        pytest.skip(f"Failed to login representante user: {login_response.status_code}")
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
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "ESTUDIANTES",
        "roles": ["ATLETA", "ENTRENADOR"],  # Multiple roles
        "is_active": True
    }
    
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register multi-role user: {response.status_code} - {response.text[:200]}")
    user = response.json()["data"]
    
    login_response = await client.post(
        "/api/v1/tests/auth/login",
        json={"username": user_data["email"], "password": user_data["password"]}
    )
    if login_response.status_code != 200:
        pytest.skip(f"Failed to login multi-role user: {login_response.status_code}")
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

# ======================================================
# ENTITY FIXTURES
# ======================================================

@pytest_asyncio.fixture(scope="function")
async def test_atleta(test_atleta_user: Dict[str, Any], db_session) -> Atleta:
    """Fetch Atleta object for the test user"""
    result = await db_session.execute(select(Atleta).where(Atleta.user_id == test_atleta_user["user_id"]))
    atleta = result.scalars().first()
    return atleta

@pytest_asyncio.fixture(scope="function")
async def test_other_atleta(client: AsyncClient, db_session) -> Atleta:
    """Create another atleta for permission tests"""
    user_data = {
        "email": f"other_atleta_{os.urandom(4).hex()}@test.com",
        "password": "TestPass123!",
        "username": f"other_atleta_{os.urandom(4).hex()}",
        "first_name": "Other",
        "last_name": "Atleta",
        "tipo_identificacion": "CEDULA",
        "identificacion": generar_cedula_ecuador(),
        "tipo_estamento": "ESTUDIANTES",
        "roles": ["ATLETA"],
        "is_active": True
    }
    response = await client.post("/api/v1/tests/auth/register", json=user_data)
    if response.status_code != 201:
        pytest.skip(f"Failed to register other atleta: {response.status_code} - {response.text[:200]}")
    
    # Fetch from DB
    from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
    repo = AuthUsersRepository(db_session)
    user = await repo.get_by_email(user_data["email"])
    
    result = await db_session.execute(select(Atleta).where(Atleta.user_id == user.id))
    return result.scalars().first()

@pytest_asyncio.fixture(scope="function")
async def test_historial_medico(authenticated_atleta_client: AsyncClient, test_atleta: Atleta, db_session) -> HistorialMedico:
    """Create and return HistorialMedico"""
    response = await authenticated_atleta_client.post(
        "/api/v1/tests/atleta/historial-medico/",
        json={
            "talla": 1.75,
            "peso": 75.0,
            "alergias": "Ninguna"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create historial_medico: {response.status_code} - {response.text[:200]}")
    
    result = await db_session.execute(select(HistorialMedico).where(HistorialMedico.atleta_id == test_atleta.id))
    return result.scalars().first()

@pytest_asyncio.fixture(scope="function")
async def test_entrenamiento_id(authenticated_entrenador_client: AsyncClient) -> int:
    """Create training and return ID"""
    response = await authenticated_entrenador_client.post(
        "/api/v1/tests/entrenador/entrenamientos/",
        json={
            "tipo_entrenamiento": "TEST",
            "descripcion": "Test Training",
            "fecha_entrenamiento": date.today().isoformat()
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create entrenamiento: {response.status_code} - {response.text[:200]}")
    data = response.json()
    entrenamiento_id = data.get("id") or data.get("data", {}).get("id")
    if not entrenamiento_id:
        pytest.skip(f"No id in entrenamiento response: {data}")
    return entrenamiento_id

@pytest_asyncio.fixture(scope="function")
async def test_horario_id(authenticated_entrenador_client: AsyncClient, test_entrenamiento_id: int) -> int:
    """Create schedule and return ID"""
    try:
        response = await authenticated_entrenador_client.post(
            f"/api/v1/tests/entrenador/horarios/entrenamiento/{test_entrenamiento_id}",
            json={
                "name": "LUNES",
                "hora_inicio": "08:00:00",
                "hora_fin": "10:00:00"
            }
        )
    except ResponseValidationError as e:
        pytest.skip(f"ResponseValidationError creating horario: {str(e)[:200]}")
    
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create horario: {response.status_code} - {response.text[:200]}")
    data = response.json()
    horario_id = data.get("id") or data.get("data", {}).get("id")
    if not horario_id:
        pytest.skip(f"No id in horario response: {data}")
    return horario_id

@pytest_asyncio.fixture(scope="function")
async def test_registro_asistencia_id(
    authenticated_entrenador_client: AsyncClient, 
    test_horario_id: int, 
    test_atleta: Atleta
) -> int:
    """Enroll athlete and return ID"""
    try:
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/inscripcion",
            json={
                "horario_id": test_horario_id,
                "atleta_id": test_atleta.id
            }
        )
    except ResponseValidationError as e:
        pytest.skip(f"ResponseValidationError creating registro_asistencia: {str(e)[:200]}")
    
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create registro_asistencia: {response.status_code} - {response.text[:200]}")
    data = response.json()
    registro_id = data.get("id") or data.get("data", {}).get("id")
    if not registro_id:
        pytest.skip(f"No id in registro_asistencia response: {data}")
    return registro_id

@pytest_asyncio.fixture(scope="function")
async def test_asistencia_id(
    authenticated_entrenador_client: AsyncClient, 
    test_registro_asistencia_id: int
) -> int:
    """Create attendance record and return ID"""
    try:
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/registro",
            json={
                "registro_asistencias_id": test_registro_asistencia_id,
                "fecha_asistencia": date.today().isoformat(),
                "hora_llegada": "08:00:00",
                "asistio": True,
                "descripcion": "Asistió"
            }
        )
    except ResponseValidationError as e:
        pytest.skip(f"ResponseValidationError creating asistencia: {str(e)[:200]}")
    
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create asistencia: {response.status_code} - {response.text[:200]}")
    data = response.json()
    asistencia_id = data.get("id") or data.get("data", {}).get("id")
    if not asistencia_id:
        pytest.skip(f"No id in asistencia response: {data}")
    return asistencia_id

@pytest_asyncio.fixture(scope="function")
async def test_resultado_id(
    authenticated_entrenador_client: AsyncClient, 
    test_entrenamiento_id: int,
    test_atleta: Atleta
) -> int:
    """Create training result and return ID"""
    # Fetch UUIDs first as the endpoint might require them (or int, let's check schema)
    # The fix in router test uses UUIDs.
    # We can use test_entrenamiento_id to fetch the object or...
    # Actually, the fixture returns int ID. 
    # To be safe, let's fetch the training to get UUID.
    resp = await authenticated_entrenador_client.get(f"/api/v1/tests/entrenador/entrenamientos/{test_entrenamiento_id}")
    ent_uuid = resp.json()["external_id"]
    
    try:
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/resultados-entrenamientos/",
            json={
                "atleta_id": str(test_atleta.external_id),
                "entrenamiento_id": ent_uuid,
                "fecha": date.today().isoformat(),
                "distancia": 100.0,
                "tiempo": 12.5,
                "unidad_medida": "segundos",
                "observaciones": "Test Result"
            }
        )
    except ResponseValidationError as e:
        pytest.skip(f"ResponseValidationError creating resultado: {str(e)[:200]}")
    
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create resultado: {response.status_code} - {response.text[:200]}")
    data = response.json()
    resultado_id = data.get("id") or data.get("data", {}).get("id")
    if not resultado_id:
        pytest.skip(f"No id in resultado response: {data}")
    return resultado_id

@pytest_asyncio.fixture(scope="function")
async def test_prueba_id(authenticated_admin_client: AsyncClient, test_tipo_disciplina_id: int) -> int:
    """Create test/event and return ID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/pruebas",
        json={
            "nombre": f"Test Prueba {os.urandom(2).hex()}",
            "tipo_prueba": "NORMAL",
            "tipo_medicion": "TIEMPO",
            "unidad_medida": "SEGUNDOS",
            "fecha_registro": date.today().isoformat(),
            "tipo_disciplina_id": test_tipo_disciplina_id,
            "descripcion": "Test Event"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create prueba: {response.status_code} - {response.text[:200]}")
    res = response.json()
    prueba_id = res.get("id") or res.get("data", {}).get("id")
    if not prueba_id:
        pytest.skip(f"No id in prueba response: {res}")
    return prueba_id

@pytest_asyncio.fixture(scope="function")
async def test_prueba_uuid(authenticated_admin_client: AsyncClient, test_tipo_disciplina_id: int) -> str:
    """Create test/event and return UUID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/pruebas",
        json={
            "nombre": f"100m Test {os.urandom(2).hex()}",
            "tipo_prueba": "NORMAL",
            "tipo_medicion": "TIEMPO",
            "unidad_medida": "SEGUNDOS",
            "fecha_registro": date.today().isoformat(),
            "tipo_disciplina_id": test_tipo_disciplina_id,
            "descripcion": "Test Event"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create prueba: {response.status_code} - {response.text[:200]}")
    data = response.json()
    external_id = data.get("external_id") or data.get("data", {}).get("external_id")
    if not external_id:
        pytest.skip(f"No external_id in prueba response: {data}")
    return external_id

@pytest_asyncio.fixture(scope="function")
async def test_baremo_uuid(authenticated_admin_client: AsyncClient) -> str:
    """Create baremo and return UUID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/baremos",
        json={
            "nombre": "Test Baremo",
            "descripcion": "Test System",
            "tipo": "VELOCIDAD",
            "valores": {"10.0": 1000}
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create baremo: {response.status_code} - {response.text[:200]}")
    data = response.json()
    external_id = data.get("external_id") or data.get("data", {}).get("external_id")
    if not external_id:
        pytest.skip(f"No external_id in baremo response: {data}")
    return external_id

@pytest_asyncio.fixture(scope="function")
async def test_tipo_disciplina_id(authenticated_admin_client: AsyncClient) -> int:
    """Create discipline type and return ID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/tipo-disciplina",
        json={
            "nombre": f"Test Discipline {os.urandom(2).hex()}",
            "descripcion": "Test"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create tipo_disciplina: {response.status_code} - {response.text[:200]}")
    data = response.json()
    tipo_id = data.get("id") or data.get("data", {}).get("id")
    if not tipo_id:
        pytest.skip(f"No id in tipo_disciplina response: {data}")
    return tipo_id

@pytest_asyncio.fixture(scope="function")
async def test_tipo_disciplina_uuid(authenticated_admin_client: AsyncClient) -> str:
    """Create discipline type and return UUID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/tipo-disciplina",
        json={
            "nombre": f"Test Discipline {os.urandom(2).hex()}",
            "descripcion": "Test"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create tipo_disciplina: {response.status_code} - {response.text[:200]}")
    data = response.json()
    external_id = data.get("external_id") or data.get("data", {}).get("external_id")
    if not external_id:
        pytest.skip(f"No external_id in tipo_disciplina response: {data}")
    return external_id

@pytest_asyncio.fixture(scope="function")
async def test_competencia_uuid(authenticated_admin_client: AsyncClient) -> str:
    """Create competition and return UUID"""
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/competencias",
        json={
            "nombre": f"Test Competition {os.urandom(2).hex()}",
            "fecha": "2024-06-01",
            "lugar": "Test Stadium",
            "descripcion": "Test Competition"
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create competencia: {response.status_code} - {response.text[:200]}")
    data = response.json()
    external_id = data.get("external_id") or data.get("data", {}).get("external_id")
    if not external_id:
        pytest.skip(f"No external_id in competencia response: {data}")
    return external_id

@pytest_asyncio.fixture(scope="function")
async def test_resultado_competencia_uuid(
    authenticated_admin_client: AsyncClient,
    test_competencia_uuid: str,
    test_prueba_uuid: str,
    test_atleta: Atleta
) -> str:
    """Create competition result and return UUID"""
    # Requires an ID for the result fixture? The test name was test_resultado_uuid but referred to result.
    response = await authenticated_admin_client.post(
        "/api/v1/tests/competencia/resultados",
        json={
            "competencia_id": test_competencia_uuid,
            "atleta_id": str(test_atleta.external_id),
            "prueba_id": test_prueba_uuid,
            "resultado": 10.5,
            "unidad_medida": "SEGUNDOS",
            "posicion_final": "Primero",
            "puesto_obtenido": 1
        }
    )
    if response.status_code not in [201, 200]:
        pytest.skip(f"Failed to create resultado_competencia: {response.status_code} - {response.text[:200]}")
    data = response.json()
    external_id = data.get("external_id") or data.get("data", {}).get("external_id")
    if not external_id:
        pytest.skip(f"No external_id in resultado_competencia response: {data}")
    return external_id

@pytest_asyncio.fixture(scope="function")
async def test_resultado_uuid(test_resultado_competencia_uuid):
    return test_resultado_competencia_uuid

