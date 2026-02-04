import pytest
from datetime import date
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
import math

from app.modules.competencia.services.resultado_prueba_service import ResultadoPruebaService
from app.modules.competencia.domain.schemas.resultado_prueba_schema import (
    ResultadoPruebaCreate,
    ResultadoPruebaUpdate,
)
from app.modules.competencia.domain.models.resultado_prueba_model import ResultadoPrueba
from app.modules.competencia.domain.models.prueba_model import Prueba
from app.modules.competencia.domain.models.baremo_model import Baremo
from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.auth.domain.models.auth_user_model import AuthUserModel


@pytest.fixture
def mock_repos():
    """Fixture para crear mocks de repositorios"""
    atleta_repo = AsyncMock()
    atleta_repo.get_by_external_id = AsyncMock(return_value=None)
    atleta_repo.session = AsyncMock()

    auth_users_repo = AsyncMock()
    auth_users_repo.get_by_external_id = AsyncMock(
        return_value=MagicMock(
            first_name="Juan",
            last_name="Pérez",
            sexo="M",
            fecha_nacimiento=date(2000, 1, 1),
        )
    )

    return {
        'repo': AsyncMock(),
        'atleta_repo': atleta_repo,
        'prueba_repo': AsyncMock(),
        'baremo_repo': AsyncMock(),
        'auth_users_repo': auth_users_repo,
    }


@pytest.fixture
def service(mock_repos):
    """Fixture para crear instancia del servicio"""
    return ResultadoPruebaService(**mock_repos)


@pytest.fixture
def mock_prueba():
    """Fixture para crear una prueba mock"""
    prueba = MagicMock(spec=Prueba)
    prueba.id = 1
    prueba.external_id = uuid4()
    prueba.nombre = "100 metros planos"
    return prueba


@pytest.fixture
def mock_atleta():
    """Fixture para crear un atleta mock con usuario"""
    atleta = MagicMock(spec=Atleta)
    atleta.id = 1
    atleta.external_id = uuid4()
    atleta.user_id = 1

    # Mock del usuario asociado
    user = MagicMock(spec=AuthUserModel)
    user.first_name = "Juan"
    user.last_name = "Pérez"
    user.sexo = "M"
    # Ensure fecha_nacimiento is a date object
    user.fecha_nacimiento = date(2000, 1, 1)  # Mocked as a valid date

    atleta.user = user

    # Add explicit assertion to verify fecha_nacimiento
    assert isinstance(atleta.user.fecha_nacimiento, date), "fecha_nacimiento must be a date object"

    return atleta


@pytest.fixture
def mock_baremo():
    """Fixture para crear un baremo mock con items"""
    baremo = MagicMock(spec=Baremo)
    baremo.id = 1
    baremo.external_id = uuid4()

    # Crear items de baremo
    item1 = MagicMock(spec=ItemBaremo)
    item1.clasificacion = "EXCELENTE"
    item1.marca_minima = 10.0
    item1.marca_maxima = 11.0

    item2 = MagicMock(spec=ItemBaremo)
    item2.clasificacion = "BUENO"
    item2.marca_minima = 11.1
    item2.marca_maxima = 12.0

    item3 = MagicMock(spec=ItemBaremo)
    item3.clasificacion = "REGULAR"
    item3.marca_minima = 12.1
    item3.marca_maxima = 13.0

    baremo.items = [item1, item2, item3]
    return baremo


class TestResultadoPruebaServiceCreate:
    """Tests para el método create"""

    @pytest.mark.asyncio
    async def test_create_success_with_classification(
        self, service, mock_repos, mock_prueba, mock_atleta, mock_baremo
    ):
        """Test crear resultado con clasificación exitosa"""
        # Arrange
        assert isinstance(mock_atleta.user.fecha_nacimiento, date), "fecha_nacimiento must be a date object"

        data = ResultadoPruebaCreate(
            prueba_id=mock_prueba.external_id,
            atleta_id=mock_atleta.external_id,
            marca_obtenida=10.5,
            fecha=date.today(),
        )

        mock_repos["prueba_repo"].get_by_external_id.return_value = mock_prueba
        mock_repos["atleta_repo"].get_by_external_id = AsyncMock(return_value=mock_atleta)
        mock_repos["baremo_repo"].find_by_context.return_value = mock_baremo

        resultado_creado = MagicMock(spec=ResultadoPrueba)
        resultado_creado.clasificacion_final = "EXCELENTE"
        mock_repos["repo"].create.return_value = resultado_creado

        # Act
        result = await service.create(data, entrenador_id=1)

        # Assert
        assert result.clasificacion_final == "EXCELENTE"
        mock_repos["repo"].create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_prueba_not_found(self, service, mock_repos):
        """Test error cuando no se encuentra la prueba"""
        # Arrange
        data = ResultadoPruebaCreate(
            prueba_id=uuid4(),
            atleta_id=uuid4(),
            marca_obtenida=10.5,
            fecha=date.today(),
        )

        mock_repos["prueba_repo"].get_by_external_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.create(data, entrenador_id=1)

        assert exc_info.value.status_code == 404
        assert "Prueba no encontrada" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_create_atleta_not_found(
        self, service, mock_repos, mock_prueba, mock_atleta
    ):
        """Test error cuando no se encuentra el atleta"""
        # Arrange
        data = ResultadoPruebaCreate(
            prueba_id=mock_prueba.external_id,
            atleta_id=uuid4(),
            marca_obtenida=10.5,
            fecha=date.today(),
        )

        mock_repos["auth_users_repo"].get_by_external_id = AsyncMock(return_value=None)

        mock_repos["prueba_repo"].get_by_external_id.return_value = mock_prueba
        mock_repos["atleta_repo"].get_by_external_id = AsyncMock(return_value=None)
        mock_repos["atleta_repo"].session = MagicMock()

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.create(data, entrenador_id=1)

        assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_create_baremo_not_found(
        self, service, mock_repos, mock_prueba, mock_atleta
    ):
        """Test error cuando no se encuentra baremo"""
        # Arrange
        data = ResultadoPruebaCreate(
            prueba_id=mock_prueba.external_id,
            atleta_id=mock_atleta.external_id,
            marca_obtenida=10.5,
            fecha=date.today(),
        )

        mock_repos["prueba_repo"].get_by_external_id.return_value = mock_prueba
        mock_repos["atleta_repo"].get_by_external_id = AsyncMock(return_value=mock_atleta)
        mock_repos["baremo_repo"].find_by_context.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.create(data, entrenador_id=1)

        assert exc_info.value.status_code == 400
        assert "No se encontró un baremo" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_create_sin_clasificacion(
        self, service, mock_repos, mock_prueba, mock_atleta, mock_baremo
    ):
        """Test cuando la marca no coincide con ningún item"""
        # Arrange
        data = ResultadoPruebaCreate(
            prueba_id=mock_prueba.external_id,
            atleta_id=mock_atleta.external_id,
            marca_obtenida=15.0,  # Fuera de rango
            fecha=date.today(),
        )

        mock_repos["prueba_repo"].get_by_external_id.return_value = mock_prueba
        mock_repos["atleta_repo"].get_by_external_id = AsyncMock(return_value=mock_atleta)
        mock_repos["baremo_repo"].find_by_context.return_value = mock_baremo

        resultado_creado = MagicMock(spec=ResultadoPrueba)
        resultado_creado.clasificacion_final = "SIN CLASIFICACION"
        mock_repos["repo"].create.return_value = resultado_creado

        # Act
        result = await service.create(data, entrenador_id=1)

        # Assert
        assert result.clasificacion_final == "SIN CLASIFICACION"


class TestResultadoPruebaServiceGet:
    """Tests para métodos de consulta"""

    @pytest.mark.asyncio
    async def test_get_by_external_id_success(self, service, mock_repos):
        """Test obtener resultado por external_id exitoso"""
        # Arrange
        external_id = uuid4()
        resultado_mock = MagicMock(spec=ResultadoPrueba)
        mock_repos["repo"].get_by_external_id.return_value = resultado_mock

        # Act
        result = await service.get_by_external_id(external_id)

        # Assert
        assert result == resultado_mock
        mock_repos["repo"].get_by_external_id.assert_called_once_with(external_id)

    @pytest.mark.asyncio
    async def test_get_by_external_id_not_found(self, service, mock_repos):
        """Test error cuando no se encuentra resultado"""
        # Arrange
        external_id = uuid4()
        mock_repos["repo"].get_by_external_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await service.get_by_external_id(external_id)

        assert exc_info.value.status_code == 404
        assert "Resultado de prueba no encontrado" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_all(self, service, mock_repos):
        """Test obtener todos los resultados"""
        # Arrange
        resultados_mock = [MagicMock(spec=ResultadoPrueba) for _ in range(3)]
        mock_repos["repo"].get_all.return_value = resultados_mock

        # Act
        result = await service.get_all()

        # Assert
        assert len(result) == 3
        mock_repos["repo"].get_all.assert_called_once()


class TestResultadoPruebaServiceUpdate:
    """Tests para el método update"""

    @pytest.mark.asyncio
    async def test_update_success(self, service, mock_repos):
        """Test actualizar resultado exitoso"""
        # Arrange
        external_id = uuid4()
        resultado_mock = MagicMock(spec=ResultadoPrueba)
        resultado_mock.marca_obtenida = 10.5

        mock_repos["repo"].get_by_external_id.return_value = resultado_mock
        mock_repos["repo"].update.return_value = resultado_mock

        data = ResultadoPruebaUpdate(marca_obtenida=11.0)

        # Act
        result = await service.update(external_id, data)

        # Assert
        assert math.isclose(result.marca_obtenida, 11.0, rel_tol=1e-9)
        mock_repos["repo"].update.assert_called_once()
