"""
Módulo de Pruebas para Router de Representante.
Verifica endpoints de gestión de atletas por representante.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from datetime import date

from app.modules.representante.dependencies import get_representante_service
from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

from app.modules.auth.domain.schemas.schemas_auth import UserRead
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
async def test_register_athlete(client: AsyncClient, mock_representante_service):
    """
    Prueba el registro de un atleta (hijo) por parte de un representante.
    POST /api/v1/representante/athletes
    """
    from app.main import _APP
    
    # Usar un objeto real UserRead para evitar problemas de validación
    mock_resp = UserRead(
        external_id=uuid4(),
        username="hijo1",
        email="hijo1@test.com",
        is_active=True,
        role=RoleEnum.ATLETA
    )
    
    mock_representante_service.register_child_athlete.return_value = mock_resp

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    payload = {
        "username": "hijo1",
        "email": "hijo1@test.com",
        "password": "Password123!",
        "first_name": "Hijo",
        "last_name": "Uno",
        "tipo_identificacion": "CEDULA",
        "identificacion": "1101101101",
        "role": "ATLETA"
    }

    response = await client.post("/api/v1/representante/athletes", json=payload)
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "hijo1"
    mock_representante_service.register_child_athlete.assert_called_once()


@pytest.mark.asyncio
async def test_get_my_athletes(client: AsyncClient, mock_representante_service):
    """
    Prueba obtener la lista de atletas representados.
    GET /api/v1/representante/athletes
    """
    from app.main import _APP
    
    a1 = UserRead(
        external_id=uuid4(),
        username="hijo1",
        email="hijo1@test.com",
        is_active=True,
        role=RoleEnum.ATLETA
    )
    
    mock_representante_service.get_representante_athletes.return_value = [a1]

    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service
    _APP.dependency_overrides[get_current_user] = override_get_current_representante

    response = await client.get("/api/v1/representante/athletes")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["email"] == "hijo1@test.com"
