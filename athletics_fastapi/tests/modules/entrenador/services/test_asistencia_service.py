import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from datetime import datetime, date, time

from app.modules.entrenador.services.asistencia_service import AsistenciaService
from app.modules.entrenador.domain.schemas.registro_asistencias_schema import RegistroAsistenciasCreate
from app.modules.entrenador.domain.schemas.asistencia_schema import AsistenciaCreate


@pytest.fixture
def mock_registro_asistencias_repository():
    """Mock para RegistroAsistenciasRepository"""
    return AsyncMock()


@pytest.fixture
def mock_asistencia_repository():
    """Mock para AsistenciaRepository"""
    return AsyncMock()


@pytest.fixture
def mock_horario_repository():
    """Mock para HorarioRepository"""
    return AsyncMock()


@pytest.fixture
def asistencia_service(mock_registro_asistencias_repository, mock_asistencia_repository, mock_horario_repository):
    """Instancia del servicio con repositorios mockeados"""
    return AsistenciaService(mock_registro_asistencias_repository, mock_asistencia_repository, mock_horario_repository)


class TestAsistenciaServiceRegistroAtleta:
    """Tests para registrar atletas en horarios"""

class TestAsistenciaServiceRegistroAtleta:
    """Tests para registrar atletas en horarios"""

    @pytest.mark.asyncio
    async def test_registrar_atleta_horario_success(self, asistencia_service, mock_horario_repository, mock_registro_asistencias_repository):
        """TC-AS-01: Registrar atleta en horario exitoso"""
        # Arrange
        schema = RegistroAsistenciasCreate(
            atleta_id=1,
            horario_id=1
        )
        entrenador_id = 1
        
        # Mock horario
        mock_horario = MagicMock()
        mock_horario.id = 1
        mock_horario.name = "Lunes Mañana"
        
        # Mock registro
        mock_registro = MagicMock()
        mock_registro.atleta_id = 1
        mock_registro.horario_id = 1
        
        mock_horario_repository.get_by_id.return_value = mock_horario
        mock_registro_asistencias_repository.get_by_atleta_and_horario.return_value = None
        mock_registro_asistencias_repository.create.return_value = mock_registro
        
        # Act
        result = await asistencia_service.registrar_atleta_horario(schema, entrenador_id)
        
        # Assert
        assert result.atleta_id == 1
        assert result.horario_id == 1
        mock_registro_asistencias_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_registrar_atleta_horario_already_registered(self, asistencia_service, mock_horario_repository, mock_registro_asistencias_repository):
        """TC-AS-02: Atleta ya inscrito en horario"""
        # Arrange
        schema = RegistroAsistenciasCreate(
            atleta_id=1,
            horario_id=1
        )
        entrenador_id = 1
        
        # Mock horario
        mock_horario = MagicMock()
        mock_horario.id = 1
        mock_horario.name = "Lunes Mañana"
        
        # Mock registro existente
        mock_existing_registro = MagicMock()
        mock_existing_registro.atleta_id = 1
        mock_existing_registro.horario_id = 1
        
        mock_horario_repository.get_by_id.return_value = mock_horario
        mock_registro_asistencias_repository.get_by_atleta_and_horario.return_value = mock_existing_registro
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.registrar_atleta_horario(schema, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "El atleta ya está registrado en este horario" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_registrar_atleta_horario_not_found(self, asistencia_service, mock_horario_repository):
        """TC-AS-04: Horario no encontrado"""
        # Arrange
        schema = RegistroAsistenciasCreate(
            atleta_id=1,
            horario_id=999
        )
        entrenador_id = 1
        
        mock_horario_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.registrar_atleta_horario(schema, entrenador_id)
        
        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Horario no encontrado" in exc_info.value.detail


class TestAsistenciaServiceGetAtletas:
    """Tests para listar atletas en horario"""

    @pytest.mark.asyncio
    async def test_get_atletas_by_horario_success(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-06: Listar atletas inscritos en horario"""
        # Arrange
        horario_id = 1
        
        # Mock registros
        mock_registro_1 = MagicMock()
        mock_registro_1.atleta_id = 1
        mock_registro_1.horario_id = horario_id
        
        mock_registro_2 = MagicMock()
        mock_registro_2.atleta_id = 2
        mock_registro_2.horario_id = horario_id
        
        expected_registros = [mock_registro_1, mock_registro_2]
        
        mock_registro_asistencias_repository.get_by_horario.return_value = expected_registros
        
        # Act
        result = await asistencia_service.get_atletas_by_horario(horario_id)
        
        # Assert
        assert len(result) == 2
        assert result[0].atleta_id == 1
        assert result[1].atleta_id == 2
        mock_registro_asistencias_repository.get_by_horario.assert_called_once_with(horario_id)

    @pytest.mark.asyncio
    async def test_get_atletas_by_horario_empty(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-07: Lista vacía de atletas"""
        # Arrange
        horario_id = 1
        mock_registro_asistencias_repository.get_by_horario.return_value = []
        
        # Act
        result = await asistencia_service.get_atletas_by_horario(horario_id)
        
        # Assert
        assert len(result) == 0
        mock_registro_asistencias_repository.get_by_horario.assert_called_once_with(horario_id)


class TestAsistenciaServiceRegistroAsistencia:
    """Tests para registrar asistencia diaria"""

    @pytest.mark.asyncio
    async def test_registrar_asistencia_presente(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-09: Registrar asistencia - Presente"""
        # Arrange
        schema = AsistenciaCreate(
            registro_asistencias_id=1,
            fecha_asistencia=date.today(),
            hora_llegada=time(8, 30),
            descripcion="Participó activamente"
        )
        
        # Mock asistencia creada
        mock_asistencia = MagicMock()
        mock_asistencia.fecha_asistencia = date.today()
        mock_asistencia.hora_llegada = time(8, 30)
        mock_asistencia.registro_asistencias_id = 1
        
        mock_asistencia_repository.create.return_value = mock_asistencia
        
        # Act
        result = await asistencia_service.registrar_asistencia_diaria(schema)
        
        # Assert
        assert result.fecha_asistencia == date.today()
        assert result.hora_llegada == time(8, 30)
        assert result.registro_asistencias_id == 1
        mock_asistencia_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_registrar_asistencia_ausente(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-10: Registrar asistencia - Ausente"""
        # Arrange
        schema = AsistenciaCreate(
            registro_asistencias_id=1,
            fecha_asistencia=date.today(),
            hora_llegada=time(8, 0),
            descripcion="Justificado"
        )
        
        # Mock asistencia creada
        mock_asistencia = MagicMock()
        mock_asistencia.fecha_asistencia = date.today()
        mock_asistencia.hora_llegada = time(8, 0)
        mock_asistencia.descripcion = "Justificado"
        
        mock_asistencia_repository.create.return_value = mock_asistencia
        
        # Act
        result = await asistencia_service.registrar_asistencia_diaria(schema)
        
        # Assert
        assert result.fecha_asistencia == date.today()
        assert result.descripcion == "Justificado"
        mock_asistencia_repository.create.assert_called_once()


class TestAsistenciaServiceGetHistorial:
    """Tests para obtener historial de asistencia"""

    @pytest.mark.asyncio
    async def test_get_asistencias_by_enrollment_success(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-13: Obtener historial de asistencia"""
        # Arrange
        registro_asistencias_id = 1
        
        # Mock asistencias
        mock_asistencia_1 = MagicMock()
        mock_asistencia_1.estado = "PRESENTE"
        mock_asistencia_1.observaciones = "Buena participación"
        mock_asistencia_1.fecha = datetime(2026, 1, 15).date()
        
        mock_asistencia_2 = MagicMock()
        mock_asistencia_2.estado = "AUSENTE"
        mock_asistencia_2.observaciones = "Justificado"
        mock_asistencia_2.fecha = datetime(2026, 1, 17).date()
        
        expected_asistencias = [mock_asistencia_1, mock_asistencia_2]
        
        mock_asistencia_repository.get_by_registro_asistencias.return_value = expected_asistencias
        
        # Act
        result = await asistencia_service.get_asistencias_by_enrollment(registro_asistencias_id)
        
        # Assert
        assert len(result) == 2
        assert result[0].estado == "PRESENTE"
        assert result[1].estado == "AUSENTE"
        mock_asistencia_repository.get_by_registro_asistencias.assert_called_once_with(registro_asistencias_id)

    @pytest.mark.asyncio
    async def test_get_asistencias_by_enrollment_empty(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-14: Obtener historial vacío"""
        # Arrange
        registro_asistencias_id = 1
        mock_asistencia_repository.get_by_registro_asistencias.return_value = []
        
        # Act
        result = await asistencia_service.get_asistencias_by_enrollment(registro_asistencias_id)
        
        # Assert
        assert len(result) == 0
        mock_asistencia_repository.get_by_registro_asistencias.assert_called_once_with(registro_asistencias_id)


class TestAsistenciaServiceRemoveAtleta:
    """Tests para remover atletas de horarios"""

    @pytest.mark.asyncio
    async def test_remove_atleta_horario_success(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-15: Remover atleta de horario exitoso"""
        # Arrange
        registro_id = 1
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        
        # Act
        await asistencia_service.remove_atleta_horario(registro_id)
        
        # Assert
        mock_registro_asistencias_repository.get_by_id.assert_called_once_with(registro_id)
        mock_registro_asistencias_repository.delete.assert_called_once_with(mock_registro)

    @pytest.mark.asyncio
    async def test_remove_atleta_horario_not_found(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-16: Remover atleta de horario no encontrado"""
        # Arrange
        registro_id = 1
        mock_registro_asistencias_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.remove_atleta_horario(registro_id)
        
        assert exc_info.value.status_code == 404
        assert "Inscripción no encontrada" in exc_info.value.detail


class TestAsistenciaServiceConfirmarAsistencia:
    """Tests para confirmar asistencia por atleta"""

    @pytest.mark.asyncio
    async def test_confirmar_asistencia_atleta_success_new(self, asistencia_service, mock_registro_asistencias_repository, mock_asistencia_repository):
        """TC-AS-17: Confirmar asistencia nueva"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        mock_asistencia_repository.get_by_registro_and_date.return_value = None
        mock_created = MagicMock()
        mock_asistencia_repository.create.return_value = mock_created
        
        # Act
        result = await asistencia_service.confirmar_asistencia_atleta(registro_id, fecha)
        
        # Assert
        assert result == mock_created
        mock_registro_asistencias_repository.get_by_id.assert_called_once_with(registro_id)
        mock_asistencia_repository.get_by_registro_and_date.assert_called_once_with(registro_id, fecha)
        mock_asistencia_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_confirmar_asistencia_atleta_update_reject_to_confirm(self, asistencia_service, mock_registro_asistencias_repository, mock_asistencia_repository):
        """TC-AS-18: Actualizar de rechazado a confirmado"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        mock_existing = MagicMock()
        mock_existing.fecha_confirmacion = None
        mock_existing.atleta_confirmo = False
        mock_asistencia_repository.get_by_registro_and_date.return_value = mock_existing
        mock_updated = MagicMock()
        mock_asistencia_repository.update.return_value = mock_updated
        
        # Act
        result = await asistencia_service.confirmar_asistencia_atleta(registro_id, fecha)
        
        # Assert
        assert result == mock_updated
        assert mock_existing.atleta_confirmo == True
        mock_asistencia_repository.update.assert_called_once_with(mock_existing)

    @pytest.mark.asyncio
    async def test_confirmar_asistencia_atleta_already_confirmed(self, asistencia_service, mock_registro_asistencias_repository, mock_asistencia_repository):
        """TC-AS-19: Ya confirmado, error"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        mock_existing = MagicMock()
        mock_existing.fecha_confirmacion = datetime.now()
        mock_existing.atleta_confirmo = True
        mock_asistencia_repository.get_by_registro_and_date.return_value = mock_existing
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.confirmar_asistencia_atleta(registro_id, fecha)
        
        assert exc_info.value.status_code == 400
        assert "Ya has confirmado" in exc_info.value.detail

    @pytest.mark.asyncio
    async def test_confirmar_asistencia_atleta_registro_not_found(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-20: Registro no encontrado"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro_asistencias_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.confirmar_asistencia_atleta(registro_id, fecha)
        
        assert exc_info.value.status_code == 404
        assert "Registro no encontrado" in exc_info.value.detail


class TestAsistenciaServiceRechazarAsistencia:
    """Tests para rechazar asistencia por atleta"""

    @pytest.mark.asyncio
    async def test_rechazar_asistencia_atleta_success_new(self, asistencia_service, mock_registro_asistencias_repository, mock_asistencia_repository):
        """TC-AS-21: Rechazar asistencia nueva"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        mock_asistencia_repository.get_by_registro_and_date.return_value = None
        mock_created = MagicMock()
        mock_asistencia_repository.create.return_value = mock_created
        
        # Act
        result = await asistencia_service.rechazar_asistencia_atleta(registro_id, fecha)
        
        # Assert
        assert result == mock_created
        mock_asistencia_repository.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_rechazar_asistencia_atleta_update_existing(self, asistencia_service, mock_registro_asistencias_repository, mock_asistencia_repository):
        """TC-AS-22: Actualizar existente a rechazado"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro = MagicMock()
        mock_registro_asistencias_repository.get_by_id.return_value = mock_registro
        mock_existing = MagicMock()
        mock_existing.atleta_confirmo = True
        mock_asistencia_repository.get_by_registro_and_date.return_value = mock_existing
        mock_updated = MagicMock()
        mock_asistencia_repository.update.return_value = mock_updated
        
        # Act
        result = await asistencia_service.rechazar_asistencia_atleta(registro_id, fecha)
        
        # Assert
        assert result == mock_updated
        assert mock_existing.atleta_confirmo == False
        assert mock_existing.asistio == False
        mock_asistencia_repository.update.assert_called_once_with(mock_existing)

    @pytest.mark.asyncio
    async def test_rechazar_asistencia_atleta_registro_not_found(self, asistencia_service, mock_registro_asistencias_repository):
        """TC-AS-23: Registro no encontrado"""
        # Arrange
        registro_id = 1
        fecha = date.today()
        mock_registro_asistencias_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.rechazar_asistencia_atleta(registro_id, fecha)
        
        assert exc_info.value.status_code == 404
        assert "Registro no encontrado" in exc_info.value.detail


class TestAsistenciaServiceMarcarPresente:
    """Tests para marcar presente por entrenador"""

    @pytest.mark.asyncio
    async def test_marcar_presente_success(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-24: Marcar presente exitoso"""
        # Arrange
        asistencia_id = 1
        mock_asistencia = MagicMock()
        mock_asistencia.asistio = False
        mock_asistencia_repository.get_by_id.return_value = mock_asistencia
        mock_updated = MagicMock()
        mock_asistencia_repository.update.return_value = mock_updated
        
        # Act
        result = await asistencia_service.marcar_presente(asistencia_id)
        
        # Assert
        assert result == mock_updated
        assert mock_asistencia.asistio == True
        mock_asistencia_repository.get_by_id.assert_called_once_with(asistencia_id)
        mock_asistencia_repository.update.assert_called_once_with(mock_asistencia)

    @pytest.mark.asyncio
    async def test_marcar_presente_not_found(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-25: Asistencia no encontrada"""
        # Arrange
        asistencia_id = 1
        mock_asistencia_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.marcar_presente(asistencia_id)
        
        assert exc_info.value.status_code == 404
        assert "Asistencia no encontrada" in exc_info.value.detail


class TestAsistenciaServiceMarcarAusente:
    """Tests para marcar ausente por entrenador"""

    @pytest.mark.asyncio
    async def test_marcar_ausente_success(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-26: Marcar ausente exitoso"""
        # Arrange
        asistencia_id = 1
        mock_asistencia = MagicMock()
        mock_asistencia.asistio = True
        mock_asistencia_repository.get_by_id.return_value = mock_asistencia
        mock_updated = MagicMock()
        mock_asistencia_repository.update.return_value = mock_updated
        
        # Act
        result = await asistencia_service.marcar_ausente(asistencia_id)
        
        # Assert
        assert result == mock_updated
        assert mock_asistencia.asistio == False
        mock_asistencia_repository.get_by_id.assert_called_once_with(asistencia_id)
        mock_asistencia_repository.update.assert_called_once_with(mock_asistencia)

    @pytest.mark.asyncio
    async def test_marcar_ausente_not_found(self, asistencia_service, mock_asistencia_repository):
        """TC-AS-27: Asistencia no encontrada"""
        # Arrange
        asistencia_id = 1
        mock_asistencia_repository.get_by_id.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await asistencia_service.marcar_ausente(asistencia_id)
        
        assert exc_info.value.status_code == 404
        assert "Asistencia no encontrada" in exc_info.value.detail
