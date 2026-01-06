"""
Pruebas Unitarias para TipoDisciplinaRepository.
Verifica persistencia de Tipos de Disciplina.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from app.modules.competencia.repositories.tipo_disciplina_repository import TipoDisciplinaRepository
from app.modules.competencia.domain.models import TipoDisciplina
from app.modules.competencia.domain.schemas.tipo_disciplina_schema import TipoDisciplinaCreate

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
    return TipoDisciplinaRepository(mock_session)

@pytest.mark.asyncio
async def test_create_tipo(repo, mock_session):
    data = TipoDisciplinaCreate(nombre="Lanzamiento", descripcion="desc", estado=True)
    result = await repo.create(data)
    assert result.nombre == "Lanzamiento"
    mock_session.add.assert_called_once()

@pytest.mark.asyncio
async def test_get_tipo(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = TipoDisciplina(id=1)
    mock_session.execute.return_value = mock_result
    
    result = await repo.get(uuid4())
    assert result.id == 1

@pytest.mark.asyncio
async def test_list_tipos(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    mock_session.execute.return_value = mock_result
    
    result = await repo.list()
    assert result == []
