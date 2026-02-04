import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema, UserUpdateSchema
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.auth.domain.models.auth_user_model import AuthUserModel


@pytest.fixture
def mock_session():
    """Fixture para crear mock de sesión de DB"""
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def service(mock_session):
    """Fixture para crear instancia del servicio"""
    with patch('app.modules.representante.services.representante_service.AuthUsersRepository'), \
         patch('app.modules.representante.services.representante_service.AtletaRepository'), \
         patch('app.modules.representante.services.representante_service.ResultadoCompetenciaRepository'), \
         patch('app.modules.representante.services.representante_service.PasswordHasher'):
        yield RepresentanteService(mock_session)


@pytest.fixture
def mock_representante():
    """Fixture para crear un representante mock"""
    representante = MagicMock(spec=Representante)
    representante.id = 1
    representante.user_id = 10
    return representante


@pytest.fixture
def mock_atleta():
    """Fixture para crear un atleta mock"""
    atleta = MagicMock(spec=Atleta)
    atleta.id = 1
    atleta.user_id = 20
    atleta.representante_id = 1
    atleta.anios_experiencia = 2
    
    user = MagicMock(spec=AuthUserModel)
    user.id = 20
    user.first_name = "Juan"
    user.last_name = "Pérez"
    atleta.user = user
    
    return atleta


class TestRepresentanteServiceRegister:
    """Tests para register_child_athlete"""
    
    @pytest.mark.asyncio
    async def test_register_child_success(self, service, mock_representante):
        """Test registrar hijo atleta exitoso"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        
        new_user = MagicMock(spec=AuthUserModel)
        new_user.id = 30
        service.users_repo.create = AsyncMock(return_value=new_user)
        service.atleta_repo.get_by_user_id = AsyncMock(return_value=None)
        
        new_atleta = MagicMock(spec=Atleta)
        new_atleta.id = 2
        service.atleta_repo.create = AsyncMock(return_value=new_atleta)
        
        child_data = UserCreateSchema(
            email="hijo@test.com",
            password="Password123!",
            first_name="Pedro",
            last_name="Pérez",
            numero_identificacion="1234567890",
            tipo_identificacion="CEDULA",
            identificacion="12345678",
            tipo_estamento="ESTUDIANTES",
            role=RoleEnum.ATLETA
        )
        
        # Act
        result = await service.register_child_athlete(10, child_data)
        
        # Assert
        assert result["success"] is True
        assert result["status_code"] == 201
        assert "registrado exitosamente" in result["message"]
    
    @pytest.mark.asyncio
    async def test_register_child_not_representante(self, service):
        """Test error cuando usuario no es representante"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=None)
        
        child_data = UserCreateSchema(
            email="hijo@test.com",
            password="Password123!",
            first_name="Pedro",
            last_name="Pérez",
            numero_identificacion="1234567890",
            tipo_identificacion="CEDULA",
            identificacion="12345678",
            tipo_estamento="ESTUDIANTES",
            role=RoleEnum.ATLETA
        )
        
        # Act
        result = await service.register_child_athlete(10, child_data)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 403
        assert "no es un representante válido" in result["message"]
    
    @pytest.mark.asyncio
    async def test_register_child_duplicate_user(self, service, mock_representante):
        """Test error cuando el usuario ya existe"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        service.users_repo.create = AsyncMock(side_effect=Exception("duplicate key"))
        
        child_data = UserCreateSchema(
            email="hijo@test.com",
            password="Password123!",
            first_name="Pedro",
            last_name="Pérez",
            numero_identificacion="1234567890",
            tipo_identificacion="CEDULA",
            identificacion="12345678",
            tipo_estamento="ESTUDIANTES",
            role=RoleEnum.ATLETA
        )
        
        # Act
        result = await service.register_child_athlete(10, child_data)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 400
        assert "ya existe" in result["message"]


class TestRepresentanteServiceUpdate:
    """Tests para update_child_athlete"""
    
    @pytest.mark.asyncio
    async def test_update_child_success(self, service, mock_atleta):
        """Test actualizar hijo atleta exitoso"""
        # Arrange
        service._validate_relation = AsyncMock(return_value={
            "success": True,
            "data": mock_atleta,
            "status_code": 200
        })
        
        updated_user = MagicMock(spec=AuthUserModel)
        updated_user.first_name = "Juan Carlos"
        
        # Mock all async methods used in update_child_athlete
        service.users_repo.get_by_id_profile = AsyncMock(return_value=updated_user)
        service.users_repo.update = AsyncMock(return_value=updated_user)
        service.atleta_repo.get_by_id = AsyncMock(return_value=mock_atleta)
        
        update_data = UserUpdateSchema(
            first_name="Juan Carlos"
        )
        
        # Act
        result = await service.update_child_athlete(10, 1, update_data)
        
        # Assert
        assert result["success"] is True
        assert result["status_code"] == 200
        assert "actualizado correctamente" in result["message"]
    
    @pytest.mark.asyncio
    async def test_update_child_invalid_relation(self, service):
        """Test error cuando no hay relación válida"""
        # Arrange
        service._validate_relation = AsyncMock(return_value={
            "success": False,
            "message": "No tienes permiso",
            "status_code": 403
        })
        
        update_data = UserUpdateSchema(first_name="Juan Carlos")
        
        # Act
        result = await service.update_child_athlete(10, 1, update_data)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 403


class TestRepresentanteServiceGet:
    """Tests para métodos de consulta"""
    
    @pytest.mark.asyncio
    async def test_get_representante_athletes_success(self, service, mock_representante):
        """Test obtener atletas del representante"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        
        atletas = [MagicMock(spec=Atleta) for _ in range(3)]
        service.atleta_repo.get_by_representante_id = AsyncMock(return_value=atletas)
        
        # Act
        result = await service.get_representante_athletes(10)
        
        # Assert
        assert result["success"] is True
        assert len(result["data"]) == 3
        assert result["status_code"] == 200
    
    @pytest.mark.asyncio
    async def test_get_representante_athletes_not_representante(self, service):
        """Test error cuando usuario no es representante"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=None)
        
        # Act
        result = await service.get_representante_athletes(10)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 403
        assert result["data"] == []
    
    @pytest.mark.asyncio
    async def test_get_athlete_historial_success(self, service, mock_atleta):
        """Test obtener historial de atleta"""
        from datetime import date
        from uuid import uuid4
        # Arrange
        service._validate_relation = AsyncMock(return_value={
            "success": True,
            "data": mock_atleta,
            "status_code": 200
        })
        
        # Create proper mock objects with all required fields
        def create_resultado_mock():
            mock = MagicMock()
            mock.id = 1
            mock.external_id = uuid4()
            mock.atleta_id = 1
            mock.competencia_id = 1
            mock.prueba_id = 1
            mock.resultado = "10.5"
            mock.unidad_medida = "segundos"
            mock.posicion_final = "1"
            mock.observaciones = "Excelente"
            mock.fecha_registro = date(2024, 1, 1)
            
            # Nested competencia
            mock.competencia = MagicMock()
            mock.competencia.id = 1
            mock.competencia.nombre = "Campeonato Nacional"
            mock.competencia.descripcion = "Descripción"
            mock.competencia.fecha = date(2024, 1, 15)
            mock.competencia.lugar = "Quito"
            mock.competencia.external_id = uuid4()
            
            # Nested prueba
            mock.prueba = MagicMock()
            mock.prueba.id = 1
            mock.prueba.nombre = "100m"
            mock.prueba.siglas = "100M"
            mock.prueba.fecha_registro = date(2024, 1, 1)
            mock.prueba.fecha_prueba = date(2024, 1, 15)
            mock.prueba.tipo_prueba = "COMPETENCIA"
            mock.prueba.tipo_medicion = "TIEMPO"
            mock.prueba.unidad_medida = "segundos"
            mock.prueba.external_id = uuid4()
            
            return mock
        
        historial = [create_resultado_mock() for _ in range(5)]
        service.resultado_repo.get_by_atleta = AsyncMock(return_value=historial)
        
        # Act
        result = await service.get_athlete_historial(10, 1)
        
        # Assert
        assert result["success"] is True
        assert len(result["data"]) == 5
        assert result["status_code"] == 200
    
    @pytest.mark.asyncio
    async def test_get_athlete_stats_success(self, service, mock_atleta):
        """Test obtener estadísticas de atleta"""
        # Arrange
        service._validate_relation = AsyncMock(return_value={
            "success": True,
            "data": mock_atleta,
            "status_code": 200
        })
        
        # Mock resultados con medallas
        resultado1 = MagicMock()
        resultado1.posicion_final = "Primero"
        resultado1.puesto_obtenido = 1
        
        resultado2 = MagicMock()
        resultado2.posicion_final = "Segundo"
        resultado2.puesto_obtenido = 2
        
        resultado3 = MagicMock()
        resultado3.posicion_final = "Tercero"
        resultado3.puesto_obtenido = 3
        
        service.resultado_repo.get_by_atleta = AsyncMock(return_value=[resultado1, resultado2, resultado3])
        
        # Act
        result = await service.get_athlete_stats(10, 1)
        
        # Assert
        assert result["success"] is True
        assert result["data"]["total_competencias"] == 3
        assert result["data"]["medallas"]["oro"] == 1
        assert result["data"]["medallas"]["plata"] == 1
        assert result["data"]["medallas"]["bronce"] == 1
        assert result["status_code"] == 200


class TestRepresentanteServiceValidation:
    """Tests para _validate_relation"""
    
    @pytest.mark.asyncio
    async def test_validate_relation_success(self, service, mock_representante, mock_atleta):
        """Test validación exitosa de relación"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        service.atleta_repo.get_by_id = AsyncMock(return_value=mock_atleta)
        
        # Act
        result = await service._validate_relation(10, 1)
        
        # Assert
        assert result["success"] is True
        assert result["data"] == mock_atleta
        assert result["status_code"] == 200
    
    @pytest.mark.asyncio
    async def test_validate_relation_not_representante(self, service):
        """Test error cuando no es representante"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=None)
        
        # Act
        result = await service._validate_relation(10, 1)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 403
    
    @pytest.mark.asyncio
    async def test_validate_relation_atleta_not_found(self, service, mock_representante):
        """Test error cuando atleta no existe"""
        # Arrange
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        service.atleta_repo.get_by_id = AsyncMock(return_value=None)
        
        # Act
        result = await service._validate_relation(10, 1)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 404
    
    @pytest.mark.asyncio
    async def test_validate_relation_no_permission(self, service, mock_representante, mock_atleta):
        """Test error cuando no hay permiso sobre el atleta"""
        # Arrange
        mock_atleta.representante_id = 999  # Diferente representante
        service.get_representante_by_user_id = AsyncMock(return_value=mock_representante)
        service.atleta_repo.get_by_id = AsyncMock(return_value=mock_atleta)
        
        # Act
        result = await service._validate_relation(10, 1)
        
        # Assert
        assert result["success"] is False
        assert result["status_code"] == 403
        assert "No tienes permiso" in result["message"]
