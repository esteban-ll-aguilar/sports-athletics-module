"""
Pruebas Unitarias para ResultadoCompetenciaRepository.
Verifica persistencia y consultas personalizadas de resultados.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository
from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia

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
    return ResultadoCompetenciaRepository(mock_session)

@pytest.mark.asyncio
async def test_create_resultado(repo, mock_session):
    model = ResultadoCompetencia(resultado=9.58)
    result = await repo.create(model)
    assert result.resultado == 9.58
    mock_session.add.assert_called_once()

@pytest.mark.asyncio
async def test_get_by_atleta_and_competencia(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [ResultadoCompetencia(id=1)]
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_atleta_and_competencia(1, 1)
    assert len(result) == 1
    mock_session.execute.assert_awaited_once()

@pytest.mark.asyncio
async def test_count(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalar.return_value = 10
    mock_session.execute.return_value = mock_result
    
    result = await repo.count()
    assert result == 10
