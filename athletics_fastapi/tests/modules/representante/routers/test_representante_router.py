"""
Módulo de Pruebas para Router de Representante.
Verifica endpoints de gestión de atletas por representante.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date
from types import SimpleNamespace

from app.modules.representante.dependencies import get_representante_service
from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

from app.modules.auth.domain.schemas.schemas_users import UserResponseSchema
from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum

@pytest.fixture
def mock_representante_service():
    service = AsyncMock(spec=RepresentanteService)
    return service

async def override_get_current_representante():
    """Simula un usuario autenticado con rol REPRESENTANTE"""
    user = MagicMock(spec=AuthUserModel)
    user.id = 1
    user.email = "representante@test.com"
    user.role = RoleEnum.REPRESENTANTE
    return user

@pytest.mark.asyncio
async def test_register_athlete_success(client: AsyncClient, mock_representante_service):
    """
    TC-REP-B02: Registrar Hijo (Éxito)
    """
    from app.main import _APP
    
    # Mock return from service using SimpleNamespace for Pydantic compatibility
    mock_atleta = SimpleNamespace(
        id=1,
        external_id=uuid4(),
        user_id=10,
        anios_experiencia=0,
        user=SimpleNamespace(
            id=10,
            first_name="Junior",
            last_name="Perez",
            email="junior@test.com",
            username="junior123",
            tipo_identificacion=TipoIdentificacionEnum.CEDULA,
            identificacion="1710034149", # Valid Ecuadorian ID
            phone="0999999999",
            tipo_estamento=TipoEstamentoEnum.EXTERNOS,
            role=RoleEnum.ATLETA,
            is_active=True
        )
    )
    
    mock_representante_service.register_child_athlete.return_value = {
        "success": True,
        "message": "Atleta registrado exitosamente",
        "data": mock_atleta,
        "status_code": 201
    }

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    payload = {
        "username": "junior123",
        "email": "junior@test.com",
        "password": "Password123!",
        "first_name": "Junior",
        "last_name": "Perez",
        "tipo_identificacion": "CEDULA",
        "identificacion": "1710034149", # Must be valid for TC
        "phone": "0999999999",
        "tipo_estamento": "EXTERNOS"
    }

    response = await client.post("/api/v1/representante/athletes", json=payload)
    
    _APP.dependency_overrides = {}
    
    data = response.json()
    assert response.status_code == 201
    assert data["success"] is True
    assert data["message"] == "Atleta registrado exitosamente"
    assert data["data"]["user"]["first_name"] == "Junior"


@pytest.mark.asyncio
async def test_get_my_athletes_success(client: AsyncClient, mock_representante_service):
    """
    TC-REP-B01: Listar Representados (Éxito)
    """
    from app.main import _APP
    
    mock_atleta = SimpleNamespace(
        id=1,
        external_id=uuid4(),
        user_id=10,
        anios_experiencia=2,
        user=SimpleNamespace(
            id=10,
            first_name="Junior",
            last_name="Perez",
            email="junior@test.com",
            phone="0999999999",
            identificacion="1710034149"
        )
    )
    
    mock_representante_service.get_representante_athletes.return_value = {
        "success": True,
        "message": "Atletas obtenidos correctamente",
        "data": [mock_atleta],
        "status_code": 200
    }

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    response = await client.get("/api/v1/representante/athletes")
    
    _APP.dependency_overrides = {}
    
    data = response.json()
    assert response.status_code == 200
    assert data["success"] is True
    assert len(data["data"]) == 1
    assert data["data"][0]["user"]["email"] == "junior@test.com"


@pytest.mark.asyncio
async def test_get_athlete_detail_not_found(client: AsyncClient, mock_representante_service):
    """
    TC-REP-B08: Atleta No Encontrado (404)
    """
    from app.main import _APP
    
    mock_representante_service._validate_relation.return_value = {
        "success": False,
        "message": "Atleta no encontrado",
        "status_code": 404,
        "data": None
    }

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    response = await client.get("/api/v1/representante/athletes/9999")
    
    _APP.dependency_overrides = {}
    
    data = response.json()
    assert response.status_code == 404
    assert data["success"] is False
    assert data["message"] == "Atleta no encontrado"


@pytest.mark.asyncio
async def test_update_athlete_forbidden(client: AsyncClient, mock_representante_service):
    """
    TC-REP-B05: Actualizar Hijo (Ajeno) (403)
    """
    from app.main import _APP
    
    mock_representante_service.update_child_athlete.return_value = {
        "success": False,
        "message": "No tienes permiso sobre este atleta",
        "status_code": 403,
        "data": None
    }

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    payload = {"first_name": "Hacker"}
    response = await client.put("/api/v1/representante/athletes/999", json=payload)
    
    _APP.dependency_overrides = {}
    
    data = response.json()
    assert response.status_code == 403
    assert data["success"] is False
    assert data["message"] == "No tienes permiso sobre este atleta"
