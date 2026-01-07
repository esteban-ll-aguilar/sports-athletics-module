"""
Pruebas Unitarias para AtletaRepository.
Verifica consultas a base de datos usando AsyncSession mockeada.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

@pytest.fixture
def mock_session():
    session = AsyncMock()
    session.execute = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session

@pytest.fixture
def repo(mock_session):
    return AtletaRepository(mock_session)

@pytest.mark.asyncio
async def test_create_atleta(repo, mock_session):
    atleta = AuthUserModel(id=1)
    result = await repo.create(atleta)
    mock_session.add.assert_called_once_with(atleta)
    mock_session.commit.assert_awaited_once()
    assert result == atleta

@pytest.mark.asyncio
async def test_get_by_id(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = AuthUserModel(id=1, role="ATLETA")
    mock_session.execute.return_value = mock_result

    result = await repo.get_by_id(1)
    
    assert result.id == 1
    mock_session.execute.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_by_user_id(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = AuthUserModel(id=10, role="ATLETA")
    mock_session.execute.return_value = mock_result

    result = await repo.get_by_user_id(10)
    
    assert result.id == 10

@pytest.mark.asyncio
async def test_get_all(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [AuthUserModel(), AuthUserModel()]
    mock_session.execute.return_value = mock_result

    result = await repo.get_all()
    
    assert len(result) == 2

@pytest.mark.asyncio
async def test_count(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalar.return_value = 5
    mock_session.execute.return_value = mock_result

    result = await repo.count()
    
    assert result == 5
