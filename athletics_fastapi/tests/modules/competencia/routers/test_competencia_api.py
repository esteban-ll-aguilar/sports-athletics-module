"""
Módulo de Pruebas para Router de Competencias.
Verifica endpoints de gestión de competencias (crear, listar) utilizando mocks para el servicio.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime

from app.modules.competencia.dependencies import get_competencia_service
from app.modules.competencia.services.competencia_service import CompetenciaService
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

@pytest.fixture
def mock_competencia_service():
    """
    Fixture del servicio de competencias mockeado.
    """
    service = AsyncMock(spec=CompetenciaService)
    return service

async def override_get_current_entrenador():
    """
    Override para simular un Entrenador autenticado.
    """
    user = MagicMock(spec=AuthUserModel)
    user.id = uuid4()
    user.email = "entrenador@test.com"
    user.profile = MagicMock()
    user.profile.role = RoleEnum.ENTRENADOR
    return user

@pytest.mark.asyncio
async def test_create_competencia(client: AsyncClient, mock_competencia_service):
    """
    Prueba la creación de una competencia (/api/v1/competencia/competencias).
    Verifica que se envíen los datos correctos al servicio y se retorne 201 Created.
    """
    from app.main import _APP
    
    mock_response = MagicMock()
    mock_response.external_id = uuid4()
    mock_response.nombre = "Competencia Test"
    # Mockear otros atributos necesarios del schema CompetenciaRead
    mock_response.fecha = datetime.now().date()
    mock_response.lugar = "Estadio"
    mock_response.descripcion = "Desc"
    mock_response.organizador = "Org"
    mock_response.estado = True
    
    # El servicio devuelve el objeto creado (o schema)
    mock_competencia_service.create.return_value = mock_response

    _APP.dependency_overrides[get_competencia_service] = lambda: mock_competencia_service
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

    assert response.status_code == 201
    data = response.json()
    assert data["nombre"] == "Competencia Test"
    mock_competencia_service.create.assert_called_once()

@pytest.mark.asyncio
async def test_get_competencia_by_id(client: AsyncClient, mock_competencia_service):
    """
    Prueba la obtención de una competencia por ID.
    """
    from app.main import _APP
    
    comp_id = uuid4()
    mock_response = MagicMock()
    mock_response.external_id = comp_id
    mock_response.nombre = "Comp Found"
    mock_response.fecha = datetime.now().date()
    mock_response.lugar = "Lugar"
    mock_response.descripcion = "D"
    mock_response.organizador = "O"
    mock_response.estado = True
    
    mock_competencia_service.get_by_external_id.return_value = mock_response

    _APP.dependency_overrides[get_competencia_service] = lambda: mock_competencia_service
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador
    
    response = await client.get(f"/api/v1/competencia/competencias/{comp_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["nombre"] == "Comp Found"

@pytest.mark.asyncio
async def test_update_competencia(client: AsyncClient, mock_competencia_service):
    """
    Prueba la actualización de una competencia.
    """
    from app.main import _APP
    
    comp_id = uuid4()
    mock_response = MagicMock()
    mock_response.external_id = comp_id
    mock_response.nombre = "Comp Updated"
    mock_response.fecha = datetime.now().date()
    mock_response.lugar = "Lugar Updated"
    mock_response.descripcion = "Desc Updated"
    mock_response.organizador = "Org Updated"
    mock_response.estado = True
    
    mock_competencia_service.update.return_value = mock_response

    _APP.dependency_overrides[get_competencia_service] = lambda: mock_competencia_service
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador
    
    payload = {
        "nombre": "Comp Updated",
        "lugar": "Lugar Updated"
    }

    response = await client.put(f"/api/v1/competencia/competencias/{comp_id}", json=payload)
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["nombre"] == "Comp Updated"
    mock_competencia_service.update.assert_called_once()


@pytest.mark.asyncio
async def test_delete_competencia(client: AsyncClient, mock_competencia_service):
    """
    Prueba la eliminación de una competencia.
    """
    from app.main import _APP
    
    comp_id = uuid4()
    mock_competencia_service.delete.return_value = True

    _APP.dependency_overrides[get_competencia_service] = lambda: mock_competencia_service
    _APP.dependency_overrides[get_current_user] = override_get_current_entrenador
    
    response = await client.delete(f"/api/v1/competencia/competencias/{comp_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 204
    mock_competencia_service.delete.assert_called_once_with(comp_id)
