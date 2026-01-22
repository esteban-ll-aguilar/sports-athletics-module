"""
Módulo de Pruebas para Router de Horarios (Entrenador).
Verifica endpoints de gestión de horarios (éxito y fallos).
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import datetime, time
from fastapi import HTTPException, status

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

async def override_get_current_entrenador_dependency_unauthorized():
    mock_entrenador = MagicMock()
    mock_entrenador.id = 999
    mock_entrenador.usuario_id = 999
    return mock_entrenador

# ============== TESTS PARA CREATE_HORARIO ==============

@pytest.mark.asyncio
async def test_create_horario_exitoso(client: AsyncClient, mock_horario_service):
    """
    Prueba exitosa: Crear horario con datos válidos.
    POST /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 201 Created
    """
    from app.main import _APP
    from datetime import date
    
    # Mockear respuesta exitosa
    mock_resp = MagicMock()
    mock_resp.id = 1
    mock_resp.external_id = uuid4()
    mock_resp.name = "Entrenamiento Matutino"
    mock_resp.hora_inicio = time(8, 0)
    mock_resp.hora_fin = time(10, 0)
    mock_resp.entrenamiento_id = 1
    
    # Mock entrenamiento anidado
    mock_entrenamiento = MagicMock()
    mock_entrenamiento.external_id = uuid4()
    mock_entrenamiento.tipo_entrenamiento = "Velocidad"
    mock_entrenamiento.descripcion = "Entrenamiento de velocidad"
    mock_entrenamiento.fecha_entrenamiento = date.today()
    
    # Mock entrenador anidado
    mock_entrenador = MagicMock()
    mock_user = MagicMock()
    mock_user.first_name = "Juan"
    mock_user.last_name = "Pérez"
    mock_user.profile_image = "image.jpg"
    mock_entrenador.user = mock_user
    mock_entrenamiento.entrenador = mock_entrenador
    
    mock_resp.entrenamiento = mock_entrenamiento

    mock_horario_service.create_horario.return_value = mock_resp

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
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
async def test_create_horario_entrenamiento_no_encontrado(client: AsyncClient, mock_horario_service):
    """
    Prueba de fallo: Entrenamiento no existe o no autorizado.
    POST /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 404 Not Found
    Mensaje: "Entrenamiento no encontrado o no autorizado"
    """
    from app.main import _APP
    
    mock_horario_service.create_horario.side_effect = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Entrenamiento no encontrado o no autorizado"
    )

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    payload = {
        "name": "Entrenamiento Matutino",
        "hora_inicio": "08:00:00",
        "hora_fin": "10:00:00"
    }

    entrenamiento_id = 999
    response = await client.post(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}", json=payload)
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 404
    assert "Entrenamiento no encontrado o no autorizado" in response.json()["detail"]

@pytest.mark.asyncio
async def test_create_horario_horas_invalidas(client: AsyncClient, mock_horario_service):
    """
    Prueba de fallo: Hora de inicio >= hora de fin.
    POST /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 400 Bad Request
    Mensaje: "La hora de inicio debe ser anterior a la hora de fin"
    """
    from app.main import _APP
    
    mock_horario_service.create_horario.side_effect = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="La hora de inicio debe ser anterior a la hora de fin"
    )

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    payload = {
        "name": "Entrenamiento Inválido",
        "hora_inicio": "10:00:00",
        "hora_fin": "08:00:00"  # Hora fin anterior a inicio
    }

    entrenamiento_id = 1
    response = await client.post(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}", json=payload)
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 400
    assert "La hora de inicio debe ser anterior a la hora de fin" in response.json()["detail"]

# ============== TESTS PARA GET_HORARIOS_BY_ENTRENAMIENTO ==============

@pytest.mark.asyncio
async def test_get_horarios_exitoso(client: AsyncClient, mock_horario_service):
    """
    Prueba exitosa: Obtener horarios de un entrenamiento.
    GET /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 200 OK con lista de horarios
    """
    from app.main import _APP
    from datetime import date
    
    # Simular lista de horarios con entrenamiento anidado
    h1 = MagicMock()
    h1.id = 1
    h1.external_id = uuid4()
    h1.entrenamiento_id = 1
    h1.name = "Entrenamiento Vespertino"
    h1.hora_inicio = time(16, 0)
    h1.hora_fin = time(18, 0)
    
    # Mock entrenamiento anidado
    mock_entrenamiento = MagicMock()
    mock_entrenamiento.external_id = uuid4()
    mock_entrenamiento.tipo_entrenamiento = "Resistencia"
    mock_entrenamiento.descripcion = "Entrenamiento de resistencia"
    mock_entrenamiento.fecha_entrenamiento = date.today()
    
    # Mock entrenador anidado
    mock_entrenador = MagicMock()
    mock_user = MagicMock()
    mock_user.first_name = "María"
    mock_user.last_name = "García"
    mock_user.profile_image = "profile.jpg"
    mock_entrenador.user = mock_user
    mock_entrenamiento.entrenador = mock_entrenador
    
    h1.entrenamiento = mock_entrenamiento
    
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
async def test_get_horarios_entrenamiento_no_encontrado(client: AsyncClient, mock_horario_service):
    """
    Prueba de fallo: Entrenamiento no existe o no autorizado.
    GET /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 404 Not Found
    Mensaje: "Entrenamiento no encontrado o no autorizado"
    """
    from app.main import _APP
    
    mock_horario_service.get_horarios_by_entrenamiento.side_effect = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Entrenamiento no encontrado o no autorizado"
    )

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    entrenamiento_id = 999
    response = await client.get(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 404
    assert "Entrenamiento no encontrado o no autorizado" in response.json()["detail"]

@pytest.mark.asyncio
async def test_get_horarios_lista_vacia(client: AsyncClient, mock_horario_service):
    """
    Prueba exitosa: Obtener horarios cuando no existen horarios para el entrenamiento.
    GET /api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}
    Esperado: 200 OK con lista vacía
    """
    from app.main import _APP
    
    mock_horario_service.get_horarios_by_entrenamiento.return_value = []

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    entrenamiento_id = 1
    response = await client.get(f"/api/v1/entrenador/horarios/entrenamiento/{entrenamiento_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert len(response.json()) == 0

# ============== TESTS PARA DELETE_HORARIO ==============

@pytest.mark.asyncio
async def test_delete_horario_exitoso(client: AsyncClient, mock_horario_service):
    """
    Prueba exitosa: Eliminar un horario.
    DELETE /api/v1/entrenador/horarios/{id}
    Esperado: 204 No Content
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

@pytest.mark.asyncio
async def test_delete_horario_no_encontrado(client: AsyncClient, mock_horario_service):
    """
    Prueba de fallo: Horario no existe.
    DELETE /api/v1/entrenador/horarios/{id}
    Esperado: 404 Not Found
    Mensaje: "Horario no encontrado"
    """
    from app.main import _APP
    
    mock_horario_service.delete_horario.side_effect = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Horario no encontrado"
    )

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency

    h_id = 999
    response = await client.delete(f"/api/v1/entrenador/horarios/{h_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 404
    assert "Horario no encontrado" in response.json()["detail"]

@pytest.mark.asyncio
async def test_delete_horario_sin_permisos(client: AsyncClient, mock_horario_service):
    """
    Prueba de fallo: No tienes permiso para eliminar este horario (pertenece a otro entrenador).
    DELETE /api/v1/entrenador/horarios/{id}
    Esperado: 403 Forbidden
    Mensaje: "No tienes permiso para eliminar este horario"
    """
    from app.main import _APP
    
    mock_horario_service.delete_horario.side_effect = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="No tienes permiso para eliminar este horario"
    )

    _APP.dependency_overrides[get_horario_service] = lambda: mock_horario_service
    _APP.dependency_overrides[get_current_entrenador] = override_get_current_entrenador_dependency_unauthorized

    h_id = 1
    response = await client.delete(f"/api/v1/entrenador/horarios/{h_id}")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 403
    assert "No tienes permiso para eliminar este horario" in response.json()["detail"]


