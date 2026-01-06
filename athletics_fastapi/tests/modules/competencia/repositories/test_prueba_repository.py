"""
Pruebas Unitarias para PruebaRepository.
Verifica persistencia de Pruebas.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.domain.models.prueba_model import Prueba
from app.modules.competencia.domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate
from app.modules.competencia.domain.enums.enum import PruebaType
from datetime import date

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
    return PruebaRepository(mock_session)

@pytest.mark.asyncio
async def test_create_prueba(repo, mock_session):
    data = PruebaCreate(
        siglas="100m", 
        fecha_registro=date(2025, 1, 1),
        tipo_prueba=PruebaType.NORMAL,
        unidad_medida="SEGUNDOS",
        estado=True,
        tipo_disciplina_id=1,
        baremo_id=1
    )
    result = await repo.create(data)
    assert result.siglas == "100m"
    mock_session.add.assert_called_once()
    mock_session.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_by_external_id(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = Prueba(id=1)
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_external_id("uuid")
    assert result.id == 1

@pytest.mark.asyncio
async def test_list_pruebas(repo, mock_session):
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [Prueba()]
    mock_session.execute.return_value = mock_result
    
    result = await repo.list()
    assert len(result) == 1

@pytest.mark.asyncio
async def test_update_prueba(repo, mock_session):
    # Mock existence
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = Prueba(id=1, siglas="Old")
    mock_session.execute.return_value = mock_result
    
    data = PruebaUpdate(siglas="New")
    result = await repo.update("uuid", data)
    
    assert result.siglas == "New"
    mock_session.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_delete_prueba(repo, mock_session):
    # Mock existence
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = Prueba(id=1)
    mock_session.execute.return_value = mock_result
    
    result = await repo.delete("uuid")
    assert result is True
    mock_session.delete.assert_awaited_once()
