import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from datetime import time

from app.modules.entrenador.services.horario_service import HorarioService
from app.modules.entrenador.domain.schemas.horario_schema import HorarioCreate


@pytest.fixture
def mock_horario_repository():
    """Mock para HorarioRepository"""
    return AsyncMock()


@pytest.fixture
def mock_entrenamiento_repository():
    """Mock para EntrenamientoRepository"""
    return AsyncMock()


@pytest.fixture
def horario_service(mock_horario_repository, mock_entrenamiento_repository):
    """Instancia del servicio con repositorios mockeados"""
    return HorarioService(mock_horario_repository, mock_entrenamiento_repository)


class TestHorarioServiceCreate:
    """Tests para crear horarios"""

    @pytest.mark.asyncio
    async def test_create_horario_valid(self, horario_service, mock_horario_repository, mock_entrenamiento_repository):
        """TC-HR-01: Crear horario válido"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        schema = HorarioCreate(
            name="Lunes Mañana",
            hora_inicio=time(8, 0),
            hora_fin=time(9, 0)
        )
        
        # Mock entrenamiento exists
        mock_entrenamiento = MagicMock()
        mock_entrenamiento.id = entrenamiento_id
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = mock_entrenamiento
        
        # Mock horario creado
        mock_horario = MagicMock()
        mock_horario.name = "Lunes Mañana"
        mock_horario.hora_inicio = time(8, 0)
        mock_horario.hora_fin = time(9, 0)
        mock_horario.entrenamiento_id = entrenamiento_id
        
        mock_horario_repository.create.return_value = mock_horario
        
        # Act
        result = await horario_service.create_horario(entrenamiento_id, schema, entrenador_id)
        
        # Assert
        assert result.name == "Lunes Mañana"
        assert result.hora_inicio == time(8, 0)
        assert result.hora_fin == time(9, 0)
        assert result.entrenamiento_id == entrenamiento_id
        mock_horario_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_horario_invalid_hours(self, horario_service, mock_entrenamiento_repository):
        """TC-HR-02: Rechazar si hora inicio >= hora fin"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        schema = HorarioCreate(
            name="Mal",
            hora_inicio=time(10, 0),
            hora_fin=time(8, 0)  # fin < inicio, should be invalid
        )
        
        mock_entrenamiento = MagicMock()
        mock_entrenamiento.id = entrenamiento_id
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = mock_entrenamiento
        
        # Act & Assert - validation should happen in service
        with pytest.raises(HTTPException) as exc_info:
            await horario_service.create_horario(entrenamiento_id, schema, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_create_horario_entrenamiento_not_found(self, horario_service, mock_entrenamiento_repository):
        """TC-HR-03: Entrenamiento no encontrado"""
        # Arrange
        entrenamiento_id = 999
        entrenador_id = 1
        
        schema = HorarioCreate(
            name="Lunes Mañana",
            hora_inicio=time(8, 0),
            hora_fin=time(9, 0)
        )
        
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await horario_service.create_horario(entrenamiento_id, schema, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Entrenamiento no encontrado o no autorizado" in exc_info.value.detail


class TestHorarioServiceRead:
    """Tests para leer horarios"""

    @pytest.mark.asyncio
    async def test_get_horarios_by_entrenamiento_success(self, horario_service, mock_horario_repository, mock_entrenamiento_repository):
        """TC-HR-04: Listar horarios de un entrenamiento"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        existing_entrenamiento = MagicMock()
        existing_entrenamiento.id = entrenamiento_id
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = existing_entrenamiento
        
        # Mock horarios
        mock_horario_1 = MagicMock()
        mock_horario_1.name = "Lunes Mañana"
        mock_horario_1.hora_inicio = time(8, 0)
        mock_horario_1.hora_fin = time(9, 0)
        
        mock_horario_2 = MagicMock()
        mock_horario_2.name = "Martes Tarde"
        mock_horario_2.hora_inicio = time(14, 0)
        mock_horario_2.hora_fin = time(15, 0)
        
        expected_horarios = [mock_horario_1, mock_horario_2]
        
        mock_horario_repository.get_all_by_entrenamiento.return_value = expected_horarios
        
        # Act
        result = await horario_service.get_horarios_by_entrenamiento(entrenamiento_id, entrenador_id)
        
        # Assert
        assert len(result) == 2
        assert result[0].name == "Lunes Mañana"
        assert result[1].name == "Martes Tarde"
        mock_horario_repository.get_all_by_entrenamiento.assert_called_once_with(entrenamiento_id)

    @pytest.mark.asyncio
    async def test_get_horarios_empty(self, horario_service, mock_horario_repository, mock_entrenamiento_repository):
        """TC-HR-05: Lista vacía de horarios"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        existing_entrenamiento = MagicMock()
        existing_entrenamiento.id = entrenamiento_id
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = existing_entrenamiento
        mock_horario_repository.get_all_by_entrenamiento.return_value = []
        
        # Act
        result = await horario_service.get_horarios_by_entrenamiento(entrenamiento_id, entrenador_id)
        
        # Assert
        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_get_horarios_entrenamiento_not_found(self, horario_service, mock_entrenamiento_repository):
        """TC-HR-06: Entrenamiento no encontrado al listar horarios"""
        # Arrange
        entrenamiento_id = 999
        entrenador_id = 1
        
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await horario_service.get_horarios_by_entrenamiento(entrenamiento_id, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


class TestHorarioServiceDelete:
    """Tests para eliminar horarios"""

    @pytest.mark.asyncio
    async def test_delete_horario_success(self, horario_service, mock_horario_repository, mock_entrenamiento_repository):
        """TC-HR-07: Eliminar horario exitoso"""
        # Arrange
        horario_id = 1
        entrenador_id = 1
        entrenamiento_id = 1
        
        # Mock horario y entrenamiento
        mock_horario = MagicMock()
        mock_horario.id = horario_id
        mock_horario.entrenamiento_id = entrenamiento_id
        mock_horario.name = "Lunes Mañana"
        
        mock_entrenamiento = MagicMock()
        mock_entrenamiento.id = entrenamiento_id
        mock_entrenamiento.entrenador_id = entrenador_id
        
        mock_horario_repository.get_by_id.return_value = mock_horario
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = mock_entrenamiento
        mock_horario_repository.delete.return_value = None
        
        # Act
        await horario_service.delete_horario(horario_id, entrenador_id)
        
        # Assert
        mock_horario_repository.delete.assert_called_once_with(mock_horario)

    @pytest.mark.asyncio
    async def test_delete_horario_not_found(self, horario_service, mock_horario_repository):
        """TC-HR-08: Horario no encontrado"""
        # Arrange
        horario_id = 999
        entrenador_id = 1
        
        mock_horario_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await horario_service.delete_horario(horario_id, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Horario no encontrado" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_delete_horario_no_permission(self, horario_service, mock_horario_repository, mock_entrenamiento_repository):
        """TC-HR-09: Sin permisos para eliminar horario"""
        # Arrange
        horario_id = 1
        entrenador_id = 1
        entrenamiento_id = 1
        
        # Mock horario (sin permisos)
        mock_horario = MagicMock()
        mock_horario.id = horario_id
        mock_horario.entrenamiento_id = entrenamiento_id
        mock_horario.name = "Lunes Mañana"
        
        mock_horario_repository.get_by_id.return_value = mock_horario
        mock_entrenamiento_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await horario_service.delete_horario(horario_id, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
        assert "No tienes permiso para eliminar este horario" in exc_info.value.detail
