import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from datetime import datetime, date

from app.modules.entrenador.services.entrenamiento_service import EntrenamientoService
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoCreate, EntrenamientoUpdate


@pytest.fixture
def mock_repository():
    """Mock para EntrenamientoRepository"""
    return AsyncMock()


@pytest.fixture
def entrenamiento_service(mock_repository):
    """Instancia del servicio con repositorio mockeado"""
    return EntrenamientoService(mock_repository)


class TestEntrenamientoServiceCreate:
    """Tests para crear entrenamiento"""

    @pytest.mark.asyncio
    async def test_create_entrenamiento_valid(self, entrenamiento_service, mock_repository):
        """TC-EN-01: Crear entrenamiento válido con todos los campos"""
        # Arrange
        schema = EntrenamientoCreate(
            tipo_entrenamiento="Natación Nivel Avanzado",
            descripcion="Entrenamiento de natación para atletas avanzados",
            fecha_entrenamiento=date.today(),
            horarios=[]
        )
        entrenador_id = 1
        
        expected_entrenamiento = MagicMock()
        expected_entrenamiento.id = 1
        expected_entrenamiento.external_id = "550e8400-e29b-41d4-a716-446655440000"
        expected_entrenamiento.tipo_entrenamiento = "Natación Nivel Avanzado"
        expected_entrenamiento.descripcion = "Entrenamiento de natación para atletas avanzados"
        expected_entrenamiento.fecha_entrenamiento = date.today()
        expected_entrenamiento.entrenador_id = entrenador_id
        expected_entrenamiento.horarios = []
        expected_entrenamiento.created_at = datetime.now()
        expected_entrenamiento.updated_at = datetime.now()
        
        mock_repository.create.return_value = expected_entrenamiento
        
        # Act
        result = await entrenamiento_service.create_entrenamiento(schema, entrenador_id)
        
        # Assert
        assert result.tipo_entrenamiento == "Natación Nivel Avanzado"
        assert result.fecha_entrenamiento == date.today()
        assert result.entrenador_id == entrenador_id
        mock_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_entrenamiento_with_horarios(self, entrenamiento_service, mock_repository):
        """TC-EN-02: Crear entrenamiento con horarios incluidos"""
        # Arrange
        schema = EntrenamientoCreate(
            tipo_entrenamiento="Atletismo Base",
            descripcion="Base de atletismo",
            fecha_entrenamiento=date.today(),
            horarios=[]
        )
        entrenador_id = 1
        
        expected_horario = MagicMock()
        expected_horario.id = 1
        expected_horario.external_id = "770e8400-e29b-41d4-a716-446655440002"
        expected_horario.nombre = "Lunes"
        expected_horario.hora_inicio = "06:00"
        expected_horario.hora_fin = "07:00"
        expected_horario.entrenamiento_id = 2
        
        expected_entrenamiento = MagicMock()
        expected_entrenamiento.id = 2
        expected_entrenamiento.external_id = "660e8400-e29b-41d4-a716-446655440001"
        expected_entrenamiento.tipo_entrenamiento = "Atletismo Base"
        expected_entrenamiento.descripcion = "Base de atletismo"
        expected_entrenamiento.fecha_entrenamiento = date.today()
        expected_entrenamiento.entrenador_id = entrenador_id
        expected_entrenamiento.horarios = [expected_horario]
        
        mock_repository.create.return_value = expected_entrenamiento
        
        # Act
        result = await entrenamiento_service.create_entrenamiento(schema, entrenador_id)
        
        # Assert
        assert result.tipo_entrenamiento == "Atletismo Base"
        assert len(result.horarios) == 1
        assert result.horarios[0].nombre == "Lunes"
        mock_repository.create.assert_called_once()


class TestEntrenamientoServiceRead:
    """Tests para leer entrenamientos"""

    @pytest.mark.asyncio
    async def test_get_mis_entrenamientos_success(self, entrenamiento_service, mock_repository):
        """TC-EN-06: Listar entrenamientos del entrenador"""
        # Arrange
        entrenador_id = 1
        
        mock_entrenamiento1 = MagicMock()
        mock_entrenamiento1.id = 1
        mock_entrenamiento1.external_id = "550e8400-e29b-41d4-a716-446655440000"
        mock_entrenamiento1.tipo_entrenamiento = "Natación Nivel Avanzado"
        mock_entrenamiento1.descripcion = "Entrenamiento de natación para atletas avanzados"
        mock_entrenamiento1.fecha_entrenamiento = date.today()
        mock_entrenamiento1.entrenador_id = entrenador_id
        mock_entrenamiento1.horarios = []
        
        mock_entrenamiento2 = MagicMock()
        mock_entrenamiento2.id = 2
        mock_entrenamiento2.external_id = "660e8400-e29b-41d4-a716-446655440001"
        mock_entrenamiento2.tipo_entrenamiento = "Atletismo Base"
        mock_entrenamiento2.descripcion = "Base de atletismo"
        mock_entrenamiento2.fecha_entrenamiento = date.today()
        mock_entrenamiento2.entrenador_id = entrenador_id
        mock_entrenamiento2.horarios = []
        
        expected_entrenamientos = [mock_entrenamiento1, mock_entrenamiento2]
        
        mock_repository.get_all_by_entrenador.return_value = expected_entrenamientos
        
        # Act
        result = await entrenamiento_service.get_mis_entrenamientos(entrenador_id)
        
        # Assert
        assert len(result) == 2
        assert result[0].tipo_entrenamiento == "Natación Nivel Avanzado"
        assert result[1].tipo_entrenamiento == "Atletismo Base"
        mock_repository.get_all_by_entrenador.assert_called_once_with(entrenador_id)

    @pytest.mark.asyncio
    async def test_get_mis_entrenamientos_empty(self, entrenamiento_service, mock_repository):
        """TC-EN-07: Listar entrenamientos cuando no hay registros"""
        # Arrange
        entrenador_id = 1
        mock_repository.get_all_by_entrenador.return_value = []
        
        # Act
        result = await entrenamiento_service.get_mis_entrenamientos(entrenador_id)
        
        # Assert
        assert len(result) == 0
        mock_repository.get_all_by_entrenador.assert_called_once_with(entrenador_id)

    @pytest.mark.asyncio
    async def test_get_entrenamiento_detalle_success(self, entrenamiento_service, mock_repository):
        """TC-EN-09: Ver detalle de entrenamiento"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        expected_entrenamiento = MagicMock()
        expected_entrenamiento.id = entrenamiento_id
        expected_entrenamiento.external_id = "550e8400-e29b-41d4-a716-446655440000"
        expected_entrenamiento.tipo_entrenamiento = "Natación Nivel Avanzado"
        expected_entrenamiento.descripcion = "Entrenamiento de natación para atletas avanzados"
        expected_entrenamiento.fecha_entrenamiento = date.today()
        expected_entrenamiento.entrenador_id = entrenador_id
        expected_entrenamiento.horarios = []
        
        mock_repository.get_by_id_and_entrenador.return_value = expected_entrenamiento
        
        # Act
        result = await entrenamiento_service.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        
        # Assert
        assert result.id == entrenamiento_id
        assert result.tipo_entrenamiento == "Natación Nivel Avanzado"
        mock_repository.get_by_id_and_entrenador.assert_called_once_with(entrenamiento_id, entrenador_id)

    @pytest.mark.asyncio
    async def test_get_entrenamiento_detalle_not_found(self, entrenamiento_service, mock_repository):
        """TC-EN-10: Entrenamiento no encontrado"""
        # Arrange
        entrenamiento_id = 999
        entrenador_id = 1
        mock_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await entrenamiento_service.get_entrenamiento_detalle(entrenamiento_id, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Entrenamiento no encontrado" in exc_info.value.detail


class TestEntrenamientoServiceUpdate:
    """Tests para actualizar entrenamientos"""

    @pytest.mark.asyncio
    async def test_update_entrenamiento_success(self, entrenamiento_service, mock_repository):
        """TC-EN-12: Editar entrenamiento exitoso"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        existing_entrenamiento = MagicMock()
        existing_entrenamiento.id = entrenamiento_id
        existing_entrenamiento.external_id = "550e8400-e29b-41d4-a716-446655440000"
        existing_entrenamiento.tipo_entrenamiento = "Natación Nivel Avanzado"
        existing_entrenamiento.descripcion = "Entrenamiento de natación para atletas avanzados"
        existing_entrenamiento.fecha_entrenamiento = date.today()
        existing_entrenamiento.entrenador_id = entrenador_id
        existing_entrenamiento.horarios = []
        
        schema = EntrenamientoUpdate(
            tipo_entrenamiento="Natación Nivel Intermedio",
            descripcion="Nuevo nivel intermedio",
            fecha_entrenamiento=date.today()
        )
        
        updated_entrenamiento = MagicMock()
        updated_entrenamiento.id = entrenamiento_id
        updated_entrenamiento.external_id = "550e8400-e29b-41d4-a716-446655440000"
        updated_entrenamiento.tipo_entrenamiento = "Natación Nivel Intermedio"
        updated_entrenamiento.descripcion = "Nuevo nivel intermedio"
        updated_entrenamiento.fecha_entrenamiento = date.today()
        updated_entrenamiento.entrenador_id = entrenador_id
        updated_entrenamiento.horarios = []
        
        mock_repository.get_by_id_and_entrenador.return_value = existing_entrenamiento
        mock_repository.update.return_value = updated_entrenamiento
        
        # Act
        result = await entrenamiento_service.update_entrenamiento(entrenamiento_id, schema, entrenador_id)
        
        # Assert
        assert result.tipo_entrenamiento == "Natación Nivel Intermedio"
        assert result.fecha_entrenamiento == date.today()
        mock_repository.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_entrenamiento_not_found(self, entrenamiento_service, mock_repository):
        """TC-EN-14: Actualizar entrenamiento no encontrado"""
        # Arrange
        entrenamiento_id = 999
        entrenador_id = 1
        
        schema = EntrenamientoUpdate(
            nombre="Test",
            descripcion="Test",
            disciplina="NATACION",
            nivel="AVANZADO",
            capacidad=20
        )
        
        mock_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await entrenamiento_service.update_entrenamiento(entrenamiento_id, schema, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


class TestEntrenamientoServiceDelete:
    """Tests para eliminar entrenamientos"""

    @pytest.mark.asyncio
    async def test_delete_entrenamiento_success(self, entrenamiento_service, mock_repository):
        """TC-EN-15: Eliminar entrenamiento exitoso"""
        # Arrange
        entrenamiento_id = 1
        entrenador_id = 1
        
        existing_entrenamiento = MagicMock()
        existing_entrenamiento.id = entrenamiento_id
        existing_entrenamiento.external_id = "550e8400-e29b-41d4-a716-446655440000"
        existing_entrenamiento.tipo_entrenamiento = "Natación Nivel Avanzado"
        existing_entrenamiento.descripcion = "Entrenamiento de natación para atletas avanzados"
        existing_entrenamiento.fecha_entrenamiento = date.today()
        existing_entrenamiento.entrenador_id = entrenador_id
        existing_entrenamiento.horarios = []
        
        mock_repository.get_by_id_and_entrenador.return_value = existing_entrenamiento
        mock_repository.delete.return_value = None
        
        # Act
        await entrenamiento_service.delete_entrenamiento(entrenamiento_id, entrenador_id)
        
        # Assert
        mock_repository.delete.assert_called_once_with(existing_entrenamiento)

    @pytest.mark.asyncio
    async def test_delete_entrenamiento_not_found(self, entrenamiento_service, mock_repository):
        """TC-EN-17: Eliminar entrenamiento no encontrado"""
        # Arrange
        entrenamiento_id = 999
        entrenador_id = 1
        
        mock_repository.get_by_id_and_entrenador.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await entrenamiento_service.delete_entrenamiento(entrenamiento_id, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
