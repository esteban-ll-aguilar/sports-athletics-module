import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch
from app.main import _APP
from app.modules.auth.dependencies import get_current_user

@pytest.fixture
def mock_representante_service():
    with patch("app.modules.representante.routers.v1.representante_router.RepresentanteService") as MockClass:
        yield MockClass.return_value

@pytest.mark.asyncio
async def test_get_athlete_historial_success(client: AsyncClient, mock_representante_service):
    # Mock current user as Representante
    user = MagicMock()
    user.id = 1
    _APP.dependency_overrides[get_current_user] = lambda: user
    
    # Mock the service dependency
    from app.modules.representante.dependencies import get_representante_service
    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service

    mock_representante_service.get_athlete_historial = AsyncMock(return_value={
        "success": True,
        "message": "Historial obtenido",
        "data": []
    })
    
    response = await client.get("/api/v1/representante/athletes/10/historial")
    
    assert response.status_code == 200
    mock_representante_service.get_athlete_historial.assert_called_with(1, 10)
    
    _APP.dependency_overrides = {}

@pytest.mark.asyncio
async def test_get_athlete_stats_success(client: AsyncClient, mock_representante_service):
    # Mock current user as Representante
    user = MagicMock()
    user.id = 1
    _APP.dependency_overrides[get_current_user] = lambda: user
    
    # Mock the service dependency
    from app.modules.representante.dependencies import get_representante_service
    _APP.dependency_overrides[get_representante_service] = lambda: mock_representante_service

    mock_representante_service.get_athlete_stats = AsyncMock(return_value={
        "success": True,
        "message": "Estadísticas obtenidas",
        "data": {"total_competencias": 5, "medallas": {"oro":1}, "experiencia": 2}
    })
    
    response = await client.get("/api/v1/representante/athletes/10/estadisticas")
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["data"]["total_competencias"] == 5
    mock_representante_service.get_athlete_stats.assert_called_with(1, 10)

    _APP.dependency_overrides = {}
