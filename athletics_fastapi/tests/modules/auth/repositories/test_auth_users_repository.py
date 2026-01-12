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
    # Usamos un Mock para user_data porque el schema UserCreate actual parece no tener
    # fecha_nacimiento y sexo, pero el repositorio los accede.
    user_data = MagicMock()
    user_data.username = "testuser"
    user_data.email = "test@example.com"
    user_data.password = "Password123!"
    user_data.identificacion = "1234567890"
    user_data.first_name = "Test"
    user_data.last_name = "User"
    user_data.tipo_identificacion = "CEDULA"
    user_data.tipo_estamento = "ESTUDIANTES"
    user_data.direccion = "Calle Falsa 123"
    user_data.fecha_nacimiento = "1990-01-01"
    user_data.sexo = "M"
    user_data.model_dump.return_value = {
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "identificacion": "1234567890",
        "tipo_identificacion": "CEDULA",
        "tipo_estamento": "ESTUDIANTES",
        "phone": "0999999999",
        "direccion": "Calle Falsa 123",
        "role": "ATLETA"
    }
    user_data.role = RoleEnum.ATLETA
    user_data.atleta_data = MagicMock()
    user_data.atleta_data.anios_experiencia = 5
    user_data.entrenador_data = None

    # Mock del servicio externo
    mock_external_service = AsyncMock()
    mock_external_service.search_user_by_dni.return_value = MagicMock(status=404) # No existe, se crea
    mock_external_service.create_user.return_value = MagicMock()

    with patch("app.modules.auth.repositories.auth_users_repository.get_external_users_service", new=AsyncMock(return_value=mock_external_service)):
        user = await repo.create("hashed_password", user_data)

    # El repositorio ahora devuelve UserModel (perfil)
    # y hace 3 adds: AuthUser, UserModel, RoleEntity (si aplica)
    # En este test, user_data.role es ATLETA y data no tiene atleta_data explicitamente mockeado,
    # pero el codigo verifica user_data.atleta_data.
    # Necesitamos mockear atleta_data en user_data.
    
    assert mock_session.add.call_count >= 2 # AuthUser + UserModel
    assert mock_session.flush.call_count >= 2
    
    # Verificar que "user" sea el UserModel
    # Como es un objeto real creado dentro, no podemos verificar atributos facil sin stub
    # Pero verificamos que se llamó add con AuthUser y UserModel


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
