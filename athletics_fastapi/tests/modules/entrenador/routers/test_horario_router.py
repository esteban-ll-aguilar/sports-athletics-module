"""
Módulo de Pruebas para Router de Horarios (Entrenador).
Verifica endpoints de gestión de horarios.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, time

from app.modules.entrenador.dependencies import get_horario_service, get_current_entrenador
from app.modules.entrenador.services.horario_service import HorarioService
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

@pytest.fixture
def mock_horario_service():
    # Use standard AsyncMock without spec for better compatibility immediately
    service = AsyncMock()
    return service

# Mock para get_current_entrenador directamente, evitando DB
async def override_get_current_entrenador_dependency():
    mock_entrenador = MagicMock()
    mock_entrenador.id = 1
    mock_entrenador.usuario_id = 1
    return mock_entrenador

@pytest.mark.asyncio
async def test_create_horario(client: AsyncClient, mock_horario_service):
    """
    Prueba la creación de un horario.
    POST /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    """
    from app.main import _APP
    
    # Mockear respuesta
    mock_resp = MagicMock()
    mock_resp.id = 1
    mock_resp.external_id = uuid4()
    mock_resp.name = "Entrenamiento Matutino"
    mock_resp.hora_inicio = time(8, 0)
    mock_resp.hora_fin = time(10, 0)
    mock_resp.entrenamiento_id = 1 

    mock_horario_service.create_horario.return_value = mock_resp

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    # Override DIRECTO de la dependencia de entrenador
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    payload = {
        "name": "Entrenamiento Matutino",
        "hora_inicio": "08:00:00",
        "hora_fin": "10:00:00"
    }

    entrenamiento_id = 1
    response = await client.post(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}", json=payload)
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 201
    assert response.json()["name"] == "Entrenamiento Matutino"
    mock_horario_service.create_horario.assert_called_once()

@pytest.mark.asyncio
async def test_get_horarios_by_entrenamiento(client: AsyncClient, mock_horario_service):
    """
    Prueba obtener horarios.
    GET /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    """
    from app.main import _APP
    
    # Simular lista de horarios
    h1 = MagicMock()
    h1.id = 1
    h1.external_id = uuid4()
    h1.entrenamiento_id = 1
    h1.name = "Entrenamiento Vespertino"
    h1.hora_inicio = time(16, 0)
    h1.hora_fin = time(18, 0)
    
    mock_horario_service.get_horarios_by_entrenamiento.return_value = [h1]

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    entrenamiento_id = 1
    response = await client.get(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Entrenamiento Vespertino"

@pytest.mark.asyncio
async def test_delete_horario(client: AsyncClient, mock_horario_service):
    """
    Prueba eliminar un horario.
    DELETE /api/v1/entrenador/horarios/{id}
    """
    from app.main import _APP
    
    h_id = 1
    mock_horario_service.delete_horario.return_value = True

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    response = await client.delete(f"/api/v1/entrenador/horarios/{h_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 204
    mock_horario_service.delete_horario.assert_called_once()


