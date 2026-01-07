"""
Módulo de Pruebas para Router Externo.
Verifica endpoints de integración con sistemas externos (API Usuario).
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock
from app.modules.external.services.external_users_api_service import ExternalUsersApiService
from app.modules.external.dependencies import get_external_users_service

@pytest.fixture
def mock_external_service():
    """
    Mock del servicio de integración externa.
    """
    service = AsyncMock(spec=ExternalUsersApiService)
    service.fetch_and_store_token.return_value = ("fake_token_123", "ext_id_456")
    return service

@pytest.mark.asyncio
async def test_update_token(client: AsyncClient, mock_external_service):
    """
    Prueba la actualización manual del token externo (/api/v1/external/users/token).
    """
    from app.main import _APP
    
    _APP.dependency_overrides[get_external_users_service] = lambda: mock_external_service
    
    response = await client.put("/api/v1/external/users/token")
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["token"] == "fake_token_123"
    assert data["data"]["external_id"] == "ext_id_456"
