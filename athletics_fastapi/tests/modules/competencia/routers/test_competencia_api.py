"""
Módulo de Pruebas para Router de Competencias.
Verifica endpoints de gestión de competencias (crear, listar) utilizando mocks para el servicio.
"""
import pytest
import sys
from httpx import AsyncClient
from unittest.mock import MagicMock
from uuid import uuid4
from datetime import datetime

from app.modules.competencia.dependencies import get_competencia_service
from app.modules.competencia.services.competencia_service import CompetenciaService
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

class MockORM:
    def __init__(self, **kwargs):
        for k,v in kwargs.items():
            setattr(self, k, v)

class FakeCompetenciaService:
    def __init__(self, return_value=None):
        self.return_value = return_value

    async def create(self, *args, **kwargs):
        msg = f"DEBUG_FAKE_SERVICE: Executing create on {id(self)}"
        print(msg, file=sys.stderr)
        raise RuntimeError(msg)

    async def update(self, *args, **kwargs):
        msg = f"DEBUG_FAKE_SERVICE: Executing update on {id(self)}"
        print(msg, file=sys.stderr)
        raise RuntimeError(msg)

    async def delete(self, *args, **kwargs):
        msg = f"DEBUG_FAKE_SERVICE: Executing delete on {id(self)}"
        print(msg, file=sys.stderr)
        # For delete, we might not want to raise error if testing for 200, 
        # but let's raise to confirm call.
        raise RuntimeError(msg)

    async def get_by_external_id(self, *args, **kwargs):
        return self.return_value
        
    async def get_all(self, *args, **kwargs):
        return [self.return_value] if self.return_value else []

FAKE_SERVICE_INSTANCE = None

@pytest.fixture
def mock_competencia_service():
    global FAKE_SERVICE_INSTANCE
    FAKE_SERVICE_INSTANCE = FakeCompetenciaService()
    return FAKE_SERVICE_INSTANCE

async def override_get_current_entrenador():
    user = MagicMock(spec=AuthUserModel)
    user.id = uuid4()
    user.email = "entrenador@test.com"
    user.profile = MagicMock()
    user.profile.role = RoleEnum.ENTRENADOR
    return user

@pytest.mark.asyncio
async def test_create_competencia(client: AsyncClient, mock_competencia_service):
    from app.main import _APP
    global FAKE_SERVICE_INSTANCE
    
    print(f"DEBUG_TEST: Dependency Key ID: {id(get_competencia_service)}", file=sys.stderr)
    
    mock_data = {
        "id": 1,
        "external_id": uuid4(),
        "nombre": "Competencia Test",
        "fecha": datetime.now().date(),
        "lugar": "Estadio",
        "descripcion": "Desc",
        "organizador": "Org",
        "estado": True,
        "entrenador_id": 1,
        "fecha_creacion": datetime.now(),
        "fecha_actualizacion": None
    }
    mock_response = MockORM(**mock_data)
    
    FAKE_SERVICE_INSTANCE = FakeCompetenciaService(return_value=mock_response)
    print(f"DEBUG_TEST: FAKE_SERVICE_INSTANCE ID: {id(FAKE_SERVICE_INSTANCE)}", file=sys.stderr)

    _APP.dependency_overrides[get_competencia_service] = lambda: FAKE_SERVICE_INSTANCE
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador

    payload = {
        "nombre": "Competencia Test",
        "fecha": "2024-01-01",
        "lugar": "Estadio",
        "descripcion": "Desc",
        "organizador": "Org"
    }

    response = await client.post("/api/v1/competencia/competencias", json=payload)
    
    _APP.dependency_overrides = {}

    print(f"DEBUG_TEST: Response code: {response.status_code}", file=sys.stderr)
    print(f"DEBUG_TEST: Response text: {response.text}", file=sys.stderr)

    assert response.status_code == 201

@pytest.mark.asyncio
async def test_update_competencia(client: AsyncClient, mock_competencia_service):
    from app.main import _APP
    global FAKE_SERVICE_INSTANCE
    
    comp_id = uuid4()
    mock_response = MockORM(
        id=1,
        external_id=comp_id,
        nombre="Comp Updated",
        fecha=datetime.now().date(),
        lugar="Lugar Updated",
        descripcion="Desc Updated",
        organizador="Org Updated",
        estado=True,
        entrenador_id=1,
        fecha_creacion=datetime.now(),
        fecha_actualizacion=None
    )
    
    FAKE_SERVICE_INSTANCE = FakeCompetenciaService(return_value=mock_response)
    print(f"DEBUG_TEST: FAKE_SERVICE_INSTANCE ID: {id(FAKE_SERVICE_INSTANCE)}", file=sys.stderr)
    
    _APP.dependency_overrides[get_competencia_service] = lambda: FAKE_SERVICE_INSTANCE
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador
    
    payload = {
        "nombre": "Comp Updated",
        "lugar": "Lugar Updated"
    }

    response = await client.put(f"/api/v1/competencia/competencias/{comp_id}", json=payload)
    _APP.dependency_overrides = {}
    
    print(f"DEBUG_TEST: Response code: {response.status_code}", file=sys.stderr)
    print(f"DEBUG_TEST: Response text: {response.text}", file=sys.stderr)
    
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_delete_competencia(client: AsyncClient, mock_competencia_service):
    from app.main import _APP
    global FAKE_SERVICE_INSTANCE
    
    comp_id = uuid4()
    
    FAKE_SERVICE_INSTANCE = FakeCompetenciaService(return_value=True)
    print(f"DEBUG_TEST: FAKE_SERVICE_INSTANCE ID: {id(FAKE_SERVICE_INSTANCE)}", file=sys.stderr)

    _APP.dependency_overrides[get_competencia_service] = lambda: FAKE_SERVICE_INSTANCE
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador
    
    response = await client.delete(f"/api/v1/competencia/competencias/{comp_id}")
    _APP.dependency_overrides = {}
    
    print(f"DEBUG_TEST: Response code: {response.status_code}", file=sys.stderr)
    print(f"DEBUG_TEST: Response text: {response.text}", file=sys.stderr)
    
    assert response.status_code == 200
