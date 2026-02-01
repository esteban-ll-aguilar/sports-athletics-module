"""
Pruebas Unitarias para ExternalUsersApiService.
Mocks de httpx para simular respuestas de la API externa.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.modules.external.services.external_users_api_service import ExternalUsersApiService
from app.modules.external.domain.schemas import UserExternalCreateRequest

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
    service.headers = {"Authorization": "Bearer token"}
    
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

    with patch.object(service, '_ensure_token', new_callable=AsyncMock):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response
            response = await service.create_user(data)
    
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_search_user_by_dni_success(service, mock_repo):
    """Test buscar usuario."""
    service.token = "token"
    service.external_id = "ext_id" 
    service.headers = {"Authorization": "Bearer token"}
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success", 
        "data": {"external": "uuid"},
        "message": "Found",
        "errors": None
    }

    with patch.object(service, '_ensure_token', new_callable=AsyncMock):
        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            response = await service.search_user_by_dni("0705743177")
    
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_auth_token_fallback(service, mock_repo):
    """Test obtener token con fallback a mock."""
    mock_repo.get_token_by_type.return_value = None
    
    with patch.object(service, 'fetch_and_store_token', new_callable=AsyncMock) as mock_fetch:
        mock_fetch.side_effect = Exception("API unavailable")
        token, ext_id = await service.get_auth_token()
    
    assert token == "mock-token-123"
    assert ext_id == "mock-external-id-123"


@pytest.mark.asyncio
async def test_ensure_token(service, mock_repo):
    """Test asegurar token."""
    service.token = None
    
    with patch.object(service, 'get_auth_token', new_callable=AsyncMock) as mock_get:
        mock_get.return_value = ("test_token", "test_ext_id")
        await service._ensure_token()
    
    assert service.token == "test_token"
    assert service.external_id == "test_ext_id"
    assert service.headers["Authorization"] == "Bearer test_token"


@pytest.mark.asyncio
async def test_update_user_success(service, mock_repo):
    """Test actualizar usuario."""
    service.token = "token"
    service.external_id = "ext_id"
    service.headers = {"Authorization": "Bearer token", "Content-Type": "application/json"}
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {"updated": True},
        "message": "Updated",
        "errors": None
    }

    user_update = MagicMock()
    user_update.model_dump.return_value = {"field": "value"}
    user_update.dni = "1234567890"

    mock_search_response = MagicMock()
    mock_search_response.data = {"external": "ext_id"}
    
    with patch.object(service, '_ensure_token', new_callable=AsyncMock), \
         patch.object(service, 'search_user_by_dni', new_callable=AsyncMock) as mock_search:
        
        mock_search.return_value = mock_search_response
        
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_put: # POST in service
            mock_put.return_value = mock_response
            response = await service.update_user(user_update)
    
    assert response.data["updated"] == True


@pytest.mark.asyncio
async def test_update_account_success(service, mock_repo):
    """Test actualizar cuenta."""
    service.token = "token"
    service.external_id = "ext_id"
    service.headers = {"Authorization": "Bearer token", "Content-Type": "application/json"}
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {"account_updated": True},
        "message": "Account updated",
        "errors": None
    }

    account_update = MagicMock()
    account_update.model_dump.return_value = {"field": "value"}
    account_update.dni = "1234567890"
    
    mock_search_response = MagicMock()
    mock_search_response.data = {"external": "ext_id"}

    with patch.object(service, '_ensure_token', new_callable=AsyncMock), \
         patch.object(service, 'search_user_by_dni', new_callable=AsyncMock) as mock_search:
        
        mock_search.return_value = mock_search_response
        
        with patch("httpx.AsyncClient.put", new_callable=AsyncMock) as mock_put:
            mock_put.return_value = mock_response
            response = await service.update_account(account_update)
    
    assert response.data["account_updated"] == True


@pytest.mark.asyncio
async def test_update_user_account_success(service, mock_repo):
    """Test actualizar cuenta de usuario por external_id."""
    service.token = "token"
    service.external_id = "ext_id"
    service.headers = {"Authorization": "Bearer token", "Content-Type": "application/json"}
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "status": "success",
        "data": {"user_account_updated": True},
        "message": "User account updated",
        "errors": None
    }

    user_data = MagicMock()
    
    with patch.object(service, '_ensure_token', new_callable=AsyncMock):
        with patch("httpx.AsyncClient.put", new_callable=AsyncMock) as mock_put:
            mock_put.return_value = mock_response
            response = await service.update_user_account("ext_id_123", user_data)
    
    assert response.data["user_account_updated"] == True


@pytest.mark.asyncio
async def test_fetch_and_store_token_error(service, mock_repo):
    """Test fetch token con error."""
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {"error": "Bad request"}
    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        with pytest.raises(Exception):
            await service.fetch_and_store_token()


@pytest.mark.asyncio
async def test_create_user_error(service, mock_repo):
    """Test crear usuario con error en la API externa -> activa Fallback."""
    service.token = "token"
    service.headers = {"Authorization": "Bearer token"}
    
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {
        "status": "error",
        "data": None,
        "message": "Validation error",
        "errors": ["Invalid data"]
    }
    
    user_create = MagicMock()
    user_create.model_dump.return_value = {"field": "value"}
    
    # Mock _ensure_token and let post raise HTTPException which is caught
    with patch.object(service, '_ensure_token', new_callable=AsyncMock):
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response
            
            # The service catches the exception and returns a fallback
            response = await service.create_user(user_create)
    
    # Expecting fallback response (201 Created MOCKED)
    if hasattr(response, "status_code"):
        assert response.status_code == 201 
        assert "MOCKED" in response.message
    else:
        assert response.message == "User created (MOCKED)"
