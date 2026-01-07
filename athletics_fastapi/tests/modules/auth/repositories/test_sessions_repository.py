"""
Pruebas Unitarias para SessionsRepository (Auth).
Valida la gestión de sesiones (crear, revocar, limpiar).
"""
import pytest
import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock
from app.modules.auth.repositories.sessions_repository import SessionsRepository
from app.modules.auth.domain.models.auth_users_sessions_model import AuthUsersSessionsModel

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
    return SessionsRepository(mock_session)

@pytest.mark.asyncio
async def test_create_session(repo, mock_session):
    """Prueba crear una sesión."""
    user_id = uuid.uuid4()
    access_jti = "access_123"
    refresh_jti = "refresh_123"
    expires = datetime.utcnow() + timedelta(hours=1)

    session = await repo.create_session(user_id, access_jti, refresh_jti, expires)

    assert session.user_id == user_id
    assert session.access_token == access_jti
    assert session.status is True
    mock_session.add.assert_called_once()
    mock_session.flush.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_session_by_refresh_jti(repo, mock_session):
    """Prueba obtener sesión por JTI."""
    mock_result = MagicMock()
    session_mock = AuthUsersSessionsModel(refresh_token="ref_123")
    mock_result.scalar_one_or_none.return_value = session_mock
    mock_session.execute.return_value = mock_result

    result = await repo.get_session_by_refresh_jti("ref_123")
    
    assert result == session_mock
    mock_session.execute.assert_awaited_once()

@pytest.mark.asyncio
async def test_revoke_session_by_refresh_jti(repo, mock_session):
    """Prueba revocar sesión."""
    mock_result = MagicMock()
    mock_result.rowcount = 1
    mock_session.execute.return_value = mock_result

    result = await repo.revoke_session_by_refresh_jti("ref_123")

    assert result is True
    mock_session.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_revoke_all_user_sessions(repo, mock_session):
    """Prueba revocar todas las sesiones de un usuario."""
    mock_result = MagicMock()
    mock_result.rowcount = 5
    mock_session.execute.return_value = mock_result

    count = await repo.revoke_all_user_sessions(uuid.uuid4())

    assert count == 5
    mock_session.commit.assert_awaited_once()
