"""
Pruebas Unitarias para ExternalUsersApiRepository.
Verifica persistencia de tokens externos.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
from app.modules.external.domain.enums import ExternalClassTokenType
from app.modules.external.domain.models import ExternalTokenModel

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
    return ExternalUsersApiRepository(mock_session)

@pytest.mark.asyncio
async def test_create_token(repo, mock_session):
    # Mock get returning the created token after commit (simplified logic)
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = ExternalTokenModel(token="t")
    mock_session.execute.return_value = mock_result
    
    result = await repo.create_token("t", "ext", ExternalClassTokenType.AUTH_TOKEN)
    mock_session.execute.assert_awaited()
    assert result.token == "t"

@pytest.mark.asyncio
async def test_get_token_by_type(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = ExternalTokenModel(token="found")
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_token_by_type(ExternalClassTokenType.AUTH_TOKEN)
    assert result.token == "found"

@pytest.mark.asyncio
async def test_update_token(repo, mock_session):
    # Mock existing
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.side_effect = [
        ExternalTokenModel(token="old"), # first call (get existing)
        ExternalTokenModel(token="new")  # second call (get updated)
    ]
    mock_session.execute.return_value = mock_result
    
    result = await repo.update_token("new", "ext", ExternalClassTokenType.AUTH_TOKEN)
    assert result.token == "new"
    mock_session.commit.assert_awaited()
