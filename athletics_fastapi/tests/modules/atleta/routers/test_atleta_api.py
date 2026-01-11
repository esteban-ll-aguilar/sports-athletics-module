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
    return user


# ======================================================
# TEST: CREAR HISTORIAL MÉDICO
# ======================================================
@pytest.mark.asyncio
async def test_create_historial_medico(client: AsyncClient):
    from app.main import _APP
<<<<<<< HEAD

    with patch(
        "app.modules.atleta.routers.v1.historial_medico_router.HistorialMedicoService"
    ) as MockServiceClass:

        mock_service = MockServiceClass.return_value

        # 🔥 RESPUESTA COMO DICT (FastAPI la serializa sin error)
        mock_service.create = AsyncMock(return_value={
            "external_id": str(uuid4()),
            "talla": 1.75,
            "peso": 70.0,
            "imc": 22.86,
            "alergias": "N/A",
=======
    
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
>>>>>>> 8e34e0afa0d691e5ab8656e07bab33c110cdb74f
            "enfermedades": "Ninguna",
            "enfermedades_hereditarias": "Ninguna",
        })
<<<<<<< HEAD
=======
        
        _APP.dependency_overrides = {}
        
        assert response.status_code == 201
        data = response.json()
        assert data["talla"] == 1.75
        assert data["alergias"] == "Ninguna"
>>>>>>> 8e34e0afa0d691e5ab8656e07bab33c110cdb74f

        _APP.dependency_overrides[get_current_user] = override_get_current_atleta

        # ❌ NO se envía IMC (el backend lo calcula)
        response = await client.post(
            "/api/v1/atleta/historial-medico/",
            json={
                "talla": 1.75,
                "peso": 70.0,
                "alergias": "N/A",
                "enfermedades": "Ninguna",
                "enfermedades_hereditarias": "Ninguna"
            }
        )

        _APP.dependency_overrides = {}

        assert response.status_code == 201
        body = response.json()
        assert body["talla"] == 1.75
        assert body["peso"] == 70.0
        assert body["imc"] > 0
        assert body["alergias"] == "N/A"


# ======================================================
# TEST: OBTENER MI HISTORIAL MÉDICO
# ======================================================
@pytest.mark.asyncio
async def test_get_my_historial(client: AsyncClient):
    from app.main import _APP
<<<<<<< HEAD

    with patch(
        "app.modules.atleta.routers.v1.historial_medico_router.HistorialMedicoService"
    ) as MockServiceClass:

        mock_service = MockServiceClass.return_value

        # 🔥 RESPUESTA COMO DICT
        mock_service.get_by_user = AsyncMock(return_value={
            "external_id": str(uuid4()),
            "talla": 1.75,
            "peso": 70.0,
            "imc": 22.86,
            "alergias": "A+",
            "enfermedades": None,
            "enfermedades_hereditarias": None,
        })

=======
    
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
        
>>>>>>> 8e34e0afa0d691e5ab8656e07bab33c110cdb74f
        _APP.dependency_overrides[get_current_user] = override_get_current_atleta

        response = await client.get("/api/v1/atleta/historial-medico/me")

        _APP.dependency_overrides = {}

        assert response.status_code == 200
<<<<<<< HEAD
        body = response.json()
        assert body["alergias"] == "A+"
        assert body["talla"] == 1.75
        assert body["peso"] == 70.0
=======
        assert response.json()["alergias"] == "Penicilina"
>>>>>>> 8e34e0afa0d691e5ab8656e07bab33c110cdb74f
