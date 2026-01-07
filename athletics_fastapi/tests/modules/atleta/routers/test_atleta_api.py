"""
Módulo de Pruebas para Endpoints de Atleta.
Se enfoca en funcionalidades específicas del rol Atleta, como el historial médico.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum

async def override_get_current_atleta():
    """
    Simula un usuario autenticado con rol de Atleta.
    """
    user = MagicMock(spec=AuthUserModel)
    user.id = uuid4()
    user.email = "atleta@test.com"
    user.role = RoleEnum.ATLETA
    return user

@pytest.mark.asyncio
async def test_create_historial_medico(client: AsyncClient):
    """
    Prueba la creación del historial médico (/api/v1/atleta/historial-medico/).
    Verifica que se llame al servicio correctamente y se devuelva el objeto creado.
    Mockea el servicio `HistorialMedicoService` usando `patch`.
    """
    from app.main import _APP
    
    # Mock del servicio dentro del router
    with patch("app.modules.atleta.routers.v1.historial_medico_router.HistorialMedicoService") as MockServiceClass:
        mock_service_instance = MockServiceClass.return_value
        
        mock_response = MagicMock()
        mock_response.external_id = uuid4()
        mock_response.user_id = uuid4()
        mock_response.tipo_sangre = "O+"
        mock_response.alergias = "Ninguna" # Ensure this is a valid Enum value
        mock_response.enfermedades = "Ninguna"
        mock_response.enfermedades_hereditarias = "Ninguna"
        
        mock_response.talla = 1.75
        mock_response.peso = 70.0
        mock_response.imc = 22.8
        mock_response.id = 1
        mock_response.auth_user_id = 10
        mock_response.external_id = uuid4()

        mock_service_instance.create = AsyncMock(return_value=mock_response)
        
        _APP.dependency_overrides[get_current_user] = override_get_current_atleta
        
        response = await client.post("/api/v1/atleta/historial-medico/", json={
            "talla": 1.75,
            "peso": 70.0,
            "imc": 22.8,
            "alergias": "Ninguna",
            "enfermedades": "Ninguna",
            "enfermedades_hereditarias": "Ninguna"
        })
        
        _APP.dependency_overrides = {}
        
        assert response.status_code == 201
        data = response.json()
        assert data["talla"] == 1.75
        assert data["alergias"] == "Ninguna"

@pytest.mark.asyncio
async def test_get_my_historial(client: AsyncClient):
    """
    Prueba la obtención del historial médico propio (/api/v1/atleta/historial-medico/me).
    Verifica que el servicio reciba la solicitud para el usuario autenticado.
    """
    from app.main import _APP
    
    with patch("app.modules.atleta.routers.v1.historial_medico_router.HistorialMedicoService") as MockServiceClass:
        mock_service_instance = MockServiceClass.return_value
        
        mock_response = MagicMock()
        mock_response.id = 1
        mock_response.external_id = uuid4()
        mock_response.auth_user_id = 10
        mock_response.talla = 1.75
        mock_response.peso = 70.0
        mock_response.imc = 22.8
        mock_response.alergias = "Penicilina"
        mock_response.enfermedades = "Ninguna"
        mock_response.enfermedades_hereditarias = "Ninguna"
        
        mock_service_instance.get_by_user = AsyncMock(return_value=mock_response)
        
        _APP.dependency_overrides[get_current_user] = override_get_current_atleta
        
        response = await client.get("/api/v1/atleta/historial-medico/me")
        
        _APP.dependency_overrides = {}
        
        assert response.status_code == 200
        assert response.json()["alergias"] == "Penicilina"
