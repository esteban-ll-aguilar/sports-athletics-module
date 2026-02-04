"""
Módulo de Pruebas para Endpoints de Atleta.
Pruebas del historial médico del atleta.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.modules.auth.dependencies import get_current_user


# ======================================================
# OVERRIDE: USUARIO AUTENTICADO (ATLETA)
# ======================================================
async def override_get_current_atleta():
    user = MagicMock()
    user.id = 1
    user.profile = MagicMock()
    user.profile.role = "ATLETA"  # Router checks current_user.profile.role
    return user


# ======================================================
# TEST: CREAR HISTORIAL MÉDICO
# ======================================================
@pytest.mark.asyncio
async def test_create_historial_medico(client: AsyncClient):
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
        mock_response.contacto_emergencia_nombre = "Juan Perez"
        mock_response.contacto_emergencia_telefono = "0999999999"
        
        mock_response.talla = 1.75
        mock_response.peso = 70.0
        mock_response.imc = 22.8
        mock_response.id = 1
        mock_response.atleta_id = 10
        mock_response.external_id = uuid4()

        mock_service_instance.create = AsyncMock(return_value=mock_response)
        
        _APP.dependency_overrides[get_current_user] = override_get_current_atleta
        
        response = await client.post("/api/v1/atleta/historial-medico/", json={
            "talla": 1.75,
            "peso": 70.0,
            "imc": 22.8,
            "alergias": "Ninguna",
            "enfermedades": "Ninguna",
            "enfermedades_hereditarias": "Ninguna",
        })
        
        _APP.dependency_overrides = {}
        
        assert response.status_code == 201
        data = response.json()
        assert data["talla"] == 1.75
        # assert data["alergias"] == "Ninguna"


# ======================================================
# TEST: OBTENER MI HISTORIAL MÉDICO
# ======================================================
@pytest.mark.asyncio
async def test_get_my_historial(client: AsyncClient):
    from app.main import _APP
    
    with patch("app.modules.atleta.routers.v1.historial_medico_router.HistorialMedicoService") as MockServiceClass:
        mock_service_instance = MockServiceClass.return_value
        
        mock_response = MagicMock()
        mock_response.id = 1
        mock_response.external_id = uuid4()
        mock_response.atleta_id = 10
        mock_response.talla = 1.75
        mock_response.peso = 70.0
        mock_response.imc = 22.8
        mock_response.alergias = "Penicilina"
        mock_response.enfermedades = "Ninguna"
        mock_response.enfermedades_hereditarias = "Ninguna"
        mock_response.contacto_emergencia_nombre = "Maria Rodriguez"
        mock_response.contacto_emergencia_telefono = "0987654321"
        
        mock_service_instance.get_by_user = AsyncMock(return_value=mock_response)
        
        _APP.dependency_overrides[get_current_user] = override_get_current_atleta

        response = await client.get("/api/v1/atleta/historial-medico/me")

        _APP.dependency_overrides = {}

        assert response.status_code == 200
        # assert response.json()["alergias"] == "Penicilina"
