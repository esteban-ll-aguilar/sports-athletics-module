"""
Pruebas Unitarias para ExternalUsersApiService.
Mocks de httpx para simular respuestas de la API externa.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.modules.external.services.external_users_api_service import ExternalUsersApiService
from app.modules.external.domain.schemas import UserExternalCreateRequest, UserExternalUpdateRequest

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_repo):
    return ExternalUsersApiService(mock_repo)

@pytest.mark.asyncio
async def test_get_auth_token_from_db(service, mock_repo):
    """Test obtener token desde DB."""
    mock_token = MagicMock()
    mock_token.token = "db_token"
    mock_token.external_id = "db_ext_id"
    mock_repo.get_token_by_type.return_value = mock_token

    token, ext_id = await service.get_auth_token()
    
    assert token == "db_token"
    assert ext_id == "db_ext_id"

@pytest.mark.asyncio
async def test_fetch_and_store_token_success(service, mock_repo):
    """Test fetch token exitoso."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {"token": "api_token", "external": "api_ext_id"}
    }
    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        token, ext_id = await service.fetch_and_store_token()
    
    assert token == "api_token"
    mock_repo.update_token.assert_awaited_once()

@pytest.mark.asyncio
async def test_create_user_success(service, mock_repo):
    """Test crear usuario en API externa."""
    # Mock token
    service.token = "token"
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success", 
        "data": {}, 
        "message": "created",
        "errors": None
    }
    
    data = UserExternalCreateRequest(
        first_name="First",
        last_name="Last",
        type_identification="CEDULA",
        identification="1234567890",
        type_stament="EXTERNOS",
        direction="Ave 123",
        phono="123456789",
        email="email@example.com",
        password="Password123"
    )

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        response = await service.create_user(data)
    
    assert response.status == 200

@pytest.mark.asyncio
async def test_search_user_by_dni_success(service, mock_repo):
    """Test buscar usuario."""
    service.token = "token"
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success", 
        "data": {"external": "uuid"},
        "message": "Found",
        "errors": None
    }

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_response
        response = await service.search_user_by_dni(123)
    
    assert response.data["external"] == "uuid"
