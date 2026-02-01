import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from uuid import uuid4
from datetime import date

from app.modules.entrenador.services.resultado_entrenamiento_service import ResultadoEntrenamientoService
from app.modules.entrenador.domain.schemas.resultado_entrenamiento_schema import ResultadoEntrenamientoCreate, ResultadoEntrenamientoUpdate


@pytest.fixture
def mock_session():
    """Mock para AsyncSession"""
    return AsyncMock()


@pytest.fixture
def mock_resultado_entrenamiento_repository():
    """Mock para ResultadoEntrenamientoRepository"""
    return AsyncMock()


@pytest.fixture
def mock_entrenamiento_repository():
    """Mock para EntrenamientoRepository"""
    return AsyncMock()


@pytest.fixture
def mock_atleta_repository():
    """Mock para AtletaRepository"""
    return AsyncMock()


@pytest.fixture
def resultado_entrenamiento_service(mock_session, mock_resultado_entrenamiento_repository, mock_entrenamiento_repository, mock_atleta_repository):
    """Instancia del servicio con mocks"""
    service = ResultadoEntrenamientoService(mock_session)
    service.repository = mock_resultado_entrenamiento_repository
    service.entrenamiento_repo = mock_entrenamiento_repository
    service.atleta_repo = mock_atleta_repository
    return service


class TestResultadoEntrenamientoServiceGet:
    """Tests para métodos de obtención"""

    @pytest.mark.asyncio
    async def test_get_all(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-01: Obtener todos los resultados"""
        # Arrange
        mock_resultado_entrenamiento_repository.get_all.return_value = []
        
        # Act
        result = await resultado_entrenamiento_service.get_all()
        
        # Assert
        assert result == []
        mock_resultado_entrenamiento_repository.get_all.assert_called_once_with(False, None)

    @pytest.mark.asyncio
    async def test_get_all_with_params(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-02: Obtener todos con parámetros"""
        # Arrange
        incluir_inactivos = True
        entrenador_id = 1
        mock_resultado_entrenamiento_repository.get_all.return_value = []
        
        # Act
        result = await resultado_entrenamiento_service.get_all(incluir_inactivos, entrenador_id)
        
        # Assert
        assert result == []
        mock_resultado_entrenamiento_repository.get_all.assert_called_once_with(True, 1)

    @pytest.mark.asyncio
    async def test_get_by_external_id_success(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-03: Obtener por external_id exitoso"""
        # Arrange
        external_id = uuid4()
        mock_obj = MagicMock()
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = mock_obj
        
        # Act
        result = await resultado_entrenamiento_service.get_by_external_id(external_id)
        
        # Assert
        assert result == mock_obj
        mock_resultado_entrenamiento_repository.get_by_external_id.assert_called_once_with(external_id)

    @pytest.mark.asyncio
    async def test_get_by_external_id_not_found(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-04: Obtener por external_id no encontrado"""
        # Arrange
        external_id = uuid4()
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = None
        
        # Act
        result = await resultado_entrenamiento_service.get_by_external_id(external_id)
        
        # Assert
        assert result is None
        mock_resultado_entrenamiento_repository.get_by_external_id.assert_called_once_with(external_id)


class TestResultadoEntrenamientoServiceCreate:
    """Tests para creación"""

    @pytest.mark.asyncio
    async def test_create_success(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository, mock_entrenamiento_repository, mock_atleta_repository):
        """TC-RE-05: Crear resultado exitoso"""
        # Arrange
        schema = ResultadoEntrenamientoCreate(
            entrenamiento_id=uuid4(),
            atleta_id=uuid4(),
            fecha=date.today(),
            observaciones="Buen rendimiento"
        )
        mock_entrenamiento = MagicMock()
        mock_entrenamiento.id = 1
        mock_entrenamiento_repository.get_by_external_id.return_value = mock_entrenamiento
        mock_atleta = MagicMock()
        mock_atleta.id = 1
        mock_atleta_repository.get_by_external_id.return_value = mock_atleta
        mock_created = MagicMock()
        mock_resultado_entrenamiento_repository.create.return_value = mock_created
        
        # Act
        result = await resultado_entrenamiento_service.create(schema)
        
        # Assert
        assert result == mock_created
        mock_entrenamiento_repository.get_by_external_id.assert_called_once_with(schema.entrenamiento_id)
        mock_atleta_repository.get_by_external_id.assert_called_once_with(schema.atleta_id)
        mock_resultado_entrenamiento_repository.create.assert_called_once_with(schema, 1, 1)

    @pytest.mark.asyncio
    async def test_create_entrenamiento_not_found(self, resultado_entrenamiento_service, mock_entrenamiento_repository):
        """TC-RE-06: Crear con entrenamiento no encontrado"""
        # Arrange
        schema = ResultadoEntrenamientoCreate(
            entrenamiento_id=uuid4(),
            atleta_id=uuid4(),
            fecha=date.today(),
            observaciones="Buen rendimiento"
        )
        mock_entrenamiento_repository.get_by_external_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await resultado_entrenamiento_service.create(schema)
        
        assert exc_info.value.status_code == 404
        assert "Entrenamiento" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_create_atleta_not_found(self, resultado_entrenamiento_service, mock_entrenamiento_repository, mock_atleta_repository):
        """TC-RE-07: Crear con atleta no encontrado"""
        # Arrange
        schema = ResultadoEntrenamientoCreate(
            entrenamiento_id=uuid4(),
            atleta_id=uuid4(),
            fecha=date.today(),
            observaciones="Buen rendimiento"
        )
        mock_entrenamiento = MagicMock()
        mock_entrenamiento.id = 1
        mock_entrenamiento_repository.get_by_external_id.return_value = mock_entrenamiento
        mock_atleta_repository.get_by_external_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await resultado_entrenamiento_service.create(schema)
        
        assert exc_info.value.status_code == 404
        assert "Atleta" in exc_info.value.detail


class TestResultadoEntrenamientoServiceUpdate:
    """Tests para actualización"""

    @pytest.mark.asyncio
    async def test_update_success(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-08: Actualizar exitoso"""
        # Arrange
        external_id = uuid4()
        schema = ResultadoEntrenamientoUpdate(observaciones="Actualizado")
        mock_db_obj = MagicMock()
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = mock_db_obj
        mock_updated = MagicMock()
        mock_resultado_entrenamiento_repository.update.return_value = mock_updated
        
        # Act
        result = await resultado_entrenamiento_service.update(external_id, schema)
        
        # Assert
        assert result == mock_updated
        mock_resultado_entrenamiento_repository.get_by_external_id.assert_called_once_with(external_id)
        mock_resultado_entrenamiento_repository.update.assert_called_once_with(mock_db_obj, schema)

    @pytest.mark.asyncio
    async def test_update_not_found(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-09: Actualizar no encontrado"""
        # Arrange
        external_id = uuid4()
        schema = ResultadoEntrenamientoUpdate(observaciones="Actualizado")
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await resultado_entrenamiento_service.update(external_id, schema)
        
        assert exc_info.value.status_code == 404
        assert "Resultado Entrenamiento no encontrado" in exc_info.value.detail


class TestResultadoEntrenamientoServiceDelete:
    """Tests para eliminación"""

    @pytest.mark.asyncio
    async def test_delete_success(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-10: Eliminar exitoso"""
        # Arrange
        external_id = uuid4()
        mock_db_obj = MagicMock()
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = mock_db_obj
        mock_deleted = MagicMock()
        mock_resultado_entrenamiento_repository.delete.return_value = mock_deleted
        
        # Act
        result = await resultado_entrenamiento_service.delete(external_id)
        
        # Assert
        assert result == mock_deleted
        mock_resultado_entrenamiento_repository.get_by_external_id.assert_called_once_with(external_id)
        mock_resultado_entrenamiento_repository.delete.assert_called_once_with(mock_db_obj)

    @pytest.mark.asyncio
    async def test_delete_not_found(self, resultado_entrenamiento_service, mock_resultado_entrenamiento_repository):
        """TC-RE-11: Eliminar no encontrado"""
        # Arrange
        external_id = uuid4()
        mock_resultado_entrenamiento_repository.get_by_external_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await resultado_entrenamiento_service.delete(external_id)
        
        assert exc_info.value.status_code == 404
        assert "Resultado Entrenamiento no encontrado" in exc_info.value.detail