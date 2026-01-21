"""
Pruebas Unitarias para el Repositorio de Usuarios (Auth).
Verifica la lógica de persistencia y comunicación con servicios externos mockeados.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema
from app.modules.auth.domain.enums import RoleEnum
from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum

@pytest.fixture
def mock_session():
    """Mock de AsyncSession."""
    session = AsyncMock()
    session.execute = AsyncMock()
    session.add = MagicMock()
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    return session

@pytest.fixture
def repo(mock_session):
    return AuthUsersRepository(mock_session)

@pytest.mark.asyncio
async def test_get_by_email(repo, mock_session):
    """Prueba obtener usuario por email."""
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = AuthUserModel(email="test@example.com")
    mock_session.execute.return_value = mock_result

    user = await repo.get_by_email("test@example.com")
    
    assert user is not None
    assert user.email == "test@example.com"
    mock_session.execute.assert_awaited_once()

@pytest.mark.asyncio
async def test_create_user_success(repo, mock_session):
    """
    Prueba la creación de usuario.
    Debe mockear el servicio externo 'ExternalUsersApiService'.
    """
    user_data = MagicMock()
    user_data.username = "testuser"
    user_data.email = "test@example.com"
    user_data.password = "Password123!"
    user_data.identificacion = "1234567890"
    user_data.first_name = "Test"
    user_data.last_name = "User"
    user_data.tipo_identificacion = TipoIdentificacionEnum.CEDULA
    user_data.tipo_estamento = TipoEstamentoEnum.ESTUDIANTES
    user_data.direccion = "Calle Falsa 123"
    user_data.fecha_nacimiento = "1990-01-01"
    user_data.sexo = "M"
    user_data.phone = "0999999999"
    user_data.role = RoleEnum.ATLETA
    user_data.atleta_data = MagicMock()
    user_data.atleta_data.anios_experiencia = 5
    user_data.entrenador_data = None

    # Mock del servicio externo - return a mock response
    mock_external_response = MagicMock()
    mock_external_response.data = {"external": "ext-123"}

    with patch("app.modules.external.services.external_users_api_service.ExternalUsersApiService") as MockService:
        mock_service_instance = MockService.return_value
        mock_service_instance.create_user = AsyncMock(return_value=mock_external_response)
        
        user = await repo.create("hashed_password", user_data)

    # Verify the repository made the expected calls
    assert mock_session.add.call_count >= 2  # AuthUser + UserModel
    assert mock_session.flush.call_count >= 2


@pytest.mark.asyncio
async def test_activate_user(repo, mock_session):
    """Prueba la activación de usuario."""
    user_mock = AuthUserModel(email="test@example.com", is_active=False)
    
    # Mock get_by_email
    repo.get_by_email = AsyncMock(return_value=user_mock)

    result = await repo.activate_user("test@example.com")

    assert result is True
    assert user_mock.is_active is True
    mock_session.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_activate_user_not_found(repo, mock_session):
    """Prueba activar usuario que no existe."""
    repo.get_by_email = AsyncMock(return_value=None)
    result = await repo.activate_user("unknown@example.com")
    assert result is False
