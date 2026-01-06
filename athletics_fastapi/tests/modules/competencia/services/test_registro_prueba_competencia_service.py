"""
Pruebas Unitarias para RegistroPruebaCompetenciaService.
Verifica la lógica de negocio (proxy al repositorio) para registros de pruebas.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.competencia.services.registro_prueba_competencia_service import (
    RegistroPruebaCompetenciaService
)
from app.modules.competencia.domain.models.registro_prueba_competencia_model import (
    RegistroPruebaCompetencia
)

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_repo):
    return RegistroPruebaCompetenciaService(mock_repo)

@pytest.mark.asyncio
async def test_create_registro(service, mock_repo):
    """Verifica creación de registro."""
    data = MagicMock()
    data.model_dump.return_value = {"id": 1}
    mock_repo.create.return_value = RegistroPruebaCompetencia(id=1)

    result = await service.create(data)

    assert result.id == 1
    mock_repo.create.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_all_registros(service, mock_repo):
    """Verifica obtener todos los registros."""
    mock_repo.get_all.return_value = ([], 0)
    result = await service.get_all()
    assert result == ([], 0)

@pytest.mark.asyncio
async def test_get_one_registro(service, mock_repo):
    """Verifica obtener un registro por ID."""
    mock_repo.get_by_external_id.return_value = RegistroPruebaCompetencia(id=1)
    result = await service.get_one("ext_id")
    assert result.id == 1

@pytest.mark.asyncio
async def test_update_registro(service, mock_repo):
    """Verifica actualizar registro."""
    data = MagicMock()
    data.model_dump.return_value = {"val": 1}
    mock_repo.update.return_value = RegistroPruebaCompetencia(id=1)

    result = await service.update("ext_id", data)
    assert result.id == 1
    mock_repo.update.assert_awaited_once()
