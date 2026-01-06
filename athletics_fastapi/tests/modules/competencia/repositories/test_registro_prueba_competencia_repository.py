"""
Pruebas Unitarias para RegistroPruebaCompetenciaRepository.
Verifica persistencia de registros en competencia.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from app.modules.competencia.repositories.registro_prueba_competencia_repository import (
    RegistroPruebaCompetenciaRepository
)
from app.modules.competencia.domain.models.registro_prueba_competencia_model import (
    RegistroPruebaCompetencia
)

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
    return RegistroPruebaCompetenciaRepository(mock_session)

@pytest.mark.asyncio
async def test_create_registro(repo, mock_session):
    model = RegistroPruebaCompetencia(id=1)
    result = await repo.create(model)
    assert result.id == 1
    mock_session.add.assert_called_once()

@pytest.mark.asyncio
async def test_get_all(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [RegistroPruebaCompetencia()]
    mock_session.execute.return_value = mock_result
    
    items, count = await repo.get_all()
    assert count == 1
    assert len(items) == 1

@pytest.mark.asyncio
async def test_update_registro(repo, mock_session):
    # Mock existence
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = RegistroPruebaCompetencia(id=1)
    mock_session.execute.return_value = mock_result
    
    data = {"estado": False}
    result = await repo.update(uuid4(), data)
    assert result.id == 1
    mock_session.commit.assert_awaited_once()
