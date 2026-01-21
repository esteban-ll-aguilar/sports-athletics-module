import pytest
from httpx import AsyncClient
from fastapi import status
from unittest.mock import AsyncMock
from types import SimpleNamespace
from datetime import date
import uuid
from app.main import _APP

from app.modules.auth.domain.enums.role_enum import RoleEnum, SexoEnum
from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum
from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
from app.modules.auth.dependencies import get_users_repo, get_current_user

# Base URL for users endpoints
BASE_URL = "/api/v1/auth/users"

@pytest.fixture
def mock_repo():
    repo = AsyncMock()
    return repo

@pytest.fixture
def mock_user_profile():
    # Helper to create a mock user object with profile
    def _create_user(role=RoleEnum.ATLETA, user_id=1, external_id=None):
        if external_id is None:
            external_id = uuid.uuid4()
            
        # Mock AuthUserModel
        user = SimpleNamespace()
        user.id = user_id
        user.email = "test@test.com" # Required for logger access
        
        # Mock UserProfile (User model in domain)
        user.profile = SimpleNamespace()
        user.profile.id = user_id
        user.profile.auth_user_id = user_id # Required by schema
        user.profile.external_id = external_id
        user.profile.username = "testuser"
        user.profile.first_name = "Test"
        user.profile.last_name = "User"
        user.profile.email = "test@test.com"
        user.profile.role = role
        user.profile.is_active = True
        user.profile.phone = "0999999999"
        user.profile.direccion = "Direccion Testing"
        user.profile.tipo_identificacion = TipoIdentificacionEnum.CEDULA
        # Valid Ecuadorian Cedula for testing
        user.profile.identificacion = "0705743177" 
        user.profile.tipo_estamento = TipoEstamentoEnum.ESTUDIANTES
        user.profile.sexo = SexoEnum.M
        user.profile.fecha_nacimiento = date(1990, 1, 1)
        user.profile.empresa_id = 1
        user.profile.profile_image = None
        
        # Add relationships mocks if needed (empty lists/None)
        user.profile.historial = None
        
        return user
    return _create_user

@pytest.mark.asyncio
async def test_tc_up_01_get_me_success(client, mock_repo, mock_user_profile):
    """
    TC-UP-01: Obtener Perfil (Me) - Success
    """
    user = mock_user_profile(role=RoleEnum.ATLETA, user_id=1)
    
    # Override dependencies
    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_current_user] = lambda: user

    response = await client.get(f"{BASE_URL}/me")
    
    data = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert data["success"] is True
    assert data["message"] == "Perfil obtenido exitosamente"
    assert data["data"]["id"] == 1
    assert data["data"]["email"] == "test@test.com"

@pytest.mark.asyncio
async def test_tc_up_02_update_me_success_multipart(client, mock_repo, mock_user_profile):
    """
    TC-UP-02: Actualizar Perfil (Me) - Success (Multipart)
    """
    user = mock_user_profile(user_id=1)
    
    # Mock update behavior
    async def mock_refresh(u):
        pass # Do nothing
    
    mock_repo.commit = AsyncMock()
    mock_repo.refresh = AsyncMock(side_effect=mock_refresh)

    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_current_user] = lambda: user

    # Form Data
    form_data = {
        "username": "updateduser",
        "first_name": "Updated",
        "last_name": "Name",
        "phone": "0987654321",
        "direccion": "Nueva Direccion",
        "sexo": "M",
        "tipo_identificacion": "CEDULA",
        "identificacion": "0705743177" # Keep valid
    }

    response = await client.put(
        f"{BASE_URL}/me",
        data=form_data
    )

    data = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert data["success"] is True
    assert data["message"] == "Perfil actualizado correctamente"
    # Note: In a real DB test, the object would update. Here we just return the same object 
    # but the logic inside the endpoint modifies 'user.profile' in memory.
    # Since our mock `user` is passed to the dependency, the endpoint modifies it.
    assert data["data"]["first_name"] == "Updated"

@pytest.mark.asyncio
async def test_tc_up_04_get_user_by_external_id_success(client, mock_repo, mock_user_profile):
    """
    TC-UP-04: Obtener Usuario por ID Externo (Success)
    """
    target_uuid = uuid.uuid4()
    current_user = mock_user_profile(role=RoleEnum.ADMINISTRADOR)
    
    # The repo returns the User model (profile), not the AuthUser
    target_user_full = mock_user_profile(user_id=2, external_id=target_uuid)
    target_user_profile = target_user_full.profile
    
    mock_repo.get_by_external_id.return_value = target_user_profile

    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_current_user] = lambda: current_user

    response = await client.get(f"{BASE_URL}/users/{target_uuid}")

    data = response.json()
    assert response.status_code == status.HTTP_200_OK
    assert data["success"] is True
    assert data["message"] == "Usuario encontrado exitosamente"
    assert data["data"]["external_id"] == str(target_uuid)

@pytest.mark.asyncio
async def test_tc_up_05_get_user_not_found(client, mock_repo, mock_user_profile):
    """
    TC-UP-05: Obtener Usuario (No Encontrado)
    """
    current_user = mock_user_profile(RoleEnum.ADMINISTRADOR)
    mock_repo.get_by_external_id.return_value = None
    
    random_uuid = uuid.uuid4()

    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_current_user] = lambda: current_user

    response = await client.get(f"{BASE_URL}/users/{random_uuid}")

    data = response.json()
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert data["success"] is False
    assert data["message"] == "Usuario no encontrado"

@pytest.mark.asyncio
async def test_tc_up_07_update_user_forbidden(client, mock_repo, mock_user_profile):
    """
    TC-UP-07: Actualizar Usuario (Forbidden) - Usuario normal intenta editar a otro
    """
    current_user = mock_user_profile(role=RoleEnum.ATLETA, user_id=1)
    
    target_user_full = mock_user_profile(role=RoleEnum.ATLETA, user_id=2)
    target_user_profile = target_user_full.profile
    
    mock_repo.get_by_any_id.return_value = target_user_profile

    _APP.dependency_overrides[get_users_repo] = lambda: mock_repo
    _APP.dependency_overrides[get_current_user] = lambda: current_user

    payload = {
        "first_name": "Hacker",
        "last_name": "Attempt"
    }

    # "2" is not a UUID, checking if endpoint handles "any_id" logic correctly (likely internal ID)
    # Be careful: if endpoint expects UUID in path, this might fail 422. 
    # But route is `/{user_id}` and `user_id: str` in `users.py`.
    
    response = await client.put(f"{BASE_URL}/2", json=payload)

    data = response.json()
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert data["success"] is False
    assert data["message"] == "No tienes permisos para editar este usuario"
