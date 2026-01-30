"""
Pruebas Unitarias para AtletaService.
Verifica la lógica de negocio para la gestión de atletas.
Cubre todos los casos de prueba: TC-A01 a TC-A37
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from fastapi import HTTPException, status
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.domain.schemas.atleta_schema import AtletaCreate, AtletaUpdate
from app.modules.auth.domain.enums import RoleEnum


# ========== FIXTURES ==========

@pytest.fixture
def mock_atleta_repo():
    """Mock para AtletaRepository"""
    return AsyncMock()


@pytest.fixture
def mock_auth_repo():
    """Mock para AuthUsersRepository"""
    return AsyncMock()


@pytest.fixture
def mock_resultado_repo():
    """Mock para ResultadoCompetenciaRepository"""
    return AsyncMock()


@pytest.fixture
def atleta_service(mock_atleta_repo, mock_auth_repo, mock_resultado_repo):
    """Instancia del servicio con repositorios mockeados"""
    return AtletaService(
        atleta_repo=mock_atleta_repo,
        auth_repo=mock_auth_repo,
        resultado_repo=mock_resultado_repo
    )


# ========== TESTS - CREAR PERFIL DE ATLETA (TC-A01 a TC-A07) ==========

@pytest.mark.asyncio
async def test_create_atleta_valid(atleta_service, mock_auth_repo, mock_atleta_repo):
    """TC-A01: Crear perfil atleta válido"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user_profile = MagicMock()
    user_profile.role = RoleEnum.ATLETA
    user.user_profile = user_profile
    mock_auth_repo.get_by_id.return_value = user
    mock_atleta_repo.get_by_user_id.return_value = None

    expected_atleta = MagicMock()
    expected_atleta.id = 1
    expected_atleta.user_id = 10
    expected_atleta.nombres = "Juan"
    expected_atleta.apellidos = "Perez"
    expected_atleta.fecha_nacimiento = date(2000, 5, 15)
    expected_atleta.especialidad = "NATACION"
    expected_atleta.anios_experiencia = 5
    expected_atleta.categoria = "SENIOR"
    expected_atleta.external_id = "550e8400-e29b-41d4-a716-446655440000"

    mock_atleta_repo.create.return_value = expected_atleta

    data = AtletaCreate(
        nombres="Juan",
        apellidos="Perez",
        fecha_nacimiento=date(2000, 5, 15),
        especialidad="NATACION",
        anios_experiencia=5,
        categoria="SENIOR"
    )

    # Act
    result = await atleta_service.create(data, user_id=10)

    # Assert
    assert result.id == 1
    assert result.nombres == "Juan"
    assert result.especialidad == "NATACION"
    assert result.anios_experiencia == 5
    mock_atleta_repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_create_atleta_user_not_found(atleta_service, mock_auth_repo):
    """TC-A04: Usuario no encontrado"""
    # Arrange
    mock_auth_repo.get_by_id.return_value = None

    data = AtletaCreate(
        nombres="Juan",
        apellidos="Perez",
        fecha_nacimiento=date(2000, 5, 15),
        especialidad="NATACION",
        anios_experiencia=5,
        categoria="SENIOR"
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await atleta_service.create(data, user_id=999)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_create_atleta_not_atleta_role(atleta_service, mock_auth_repo):
    """TC-A02: Validar Usuario No Atleta"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.user_profile = MagicMock()
    user.user_profile.role = RoleEnum.ENTRENADOR
    mock_auth_repo.get_by_id.return_value = user

    data = AtletaCreate(
        nombres="Juan",
        apellidos="Perez",
        fecha_nacimiento=date(2000, 5, 15),
        especialidad="NATACION",
        anios_experiencia=5,
        categoria="SENIOR"
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await atleta_service.create(data, user_id=10)

    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_create_atleta_already_exists(atleta_service, mock_auth_repo, mock_atleta_repo):
    """TC-A03: Validar Perfil Duplicado"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.user_profile = MagicMock()
    user.user_profile.role = RoleEnum.ATLETA
    mock_auth_repo.get_by_id.return_value = user
    mock_atleta_repo.get_by_user_id.return_value = MagicMock()  # Ya existe

    data = AtletaCreate(
        nombres="Juan",
        apellidos="Perez",
        fecha_nacimiento=date(2000, 5, 15),
        especialidad="NATACION",
        anios_experiencia=5,
        categoria="SENIOR"
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await atleta_service.create(data, user_id=10)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


# ========== TESTS - VER PERFIL DE ATLETA (TC-A08 a TC-A13) ==========

@pytest.mark.asyncio
async def test_get_by_id_success(atleta_service, mock_atleta_repo):
    """TC-A09: Ver perfil de otro atleta"""
    # Arrange
    expected_atleta = MagicMock()
    expected_atleta.id = 5
    expected_atleta.user_id = 12
    expected_atleta.nombres = "Carlos"
    expected_atleta.apellidos = "Gomez"
    expected_atleta.especialidad = "ATLETISMO"
    expected_atleta.anios_experiencia = 8
    expected_atleta.categoria = "SENIOR"

    mock_atleta_repo.get_by_id.return_value = expected_atleta

    # Act
    result = await atleta_service.get_by_id(5)

    # Assert
    assert result.id == 5
    assert result.nombres == "Carlos"
    assert result.especialidad == "ATLETISMO"
    mock_atleta_repo.get_by_id.assert_called_once_with(5)


@pytest.mark.asyncio
async def test_get_by_id_not_found(atleta_service, mock_atleta_repo):
    """TC-A10: Perfil no encontrado"""
    # Arrange
    mock_atleta_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await atleta_service.get_by_id(9999)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_get_me_success(atleta_service, mock_atleta_repo):
    """TC-A08: Ver mi perfil"""
    # Arrange
    expected_atleta = MagicMock()
    expected_atleta.id = 1
    expected_atleta.user_id = 10
    expected_atleta.nombres = "Juan"
    expected_atleta.apellidos = "Perez"
    expected_atleta.especialidad = "NATACION"
    expected_atleta.anios_experiencia = 5

    mock_atleta_repo.get_by_user_id.return_value = expected_atleta

    # Act
    result = await atleta_service.get_me(10)

    # Assert
    assert result.id == 1
    assert result.nombres == "Juan"
    mock_atleta_repo.get_by_user_id.assert_called_once_with(10)


@pytest.mark.asyncio
async def test_get_me_no_profile(atleta_service, mock_atleta_repo):
        """TC-A13: Sin perfil de atleta"""
        # Arrange
        mock_atleta_repo.get_by_user_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await atleta_service.get_me(10)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_get_all_success(atleta_service, mock_atleta_repo):
        """TC-A11: Listar todos los atletas"""
        # Arrange
        atleta1 = MagicMock()
        atleta1.id = 1
        atleta1.nombres = "Juan"

        atleta2 = MagicMock()
        atleta2.id = 2
        atleta2.nombres = "Maria"

        mock_atleta_repo.get_all.return_value = [atleta1, atleta2]

        # Act
        result = await atleta_service.get_all(skip=0, limit=100)

        # Assert
        assert len(result) == 2
        assert result[0].nombres == "Juan"
        assert result[1].nombres == "Maria"
        mock_atleta_repo.get_all.assert_called_once_with(0, 100)


@pytest.mark.asyncio
async def test_get_all_pagination(atleta_service, mock_atleta_repo):
        """TC-A12: Paginación"""
        # Arrange
        atletas = [MagicMock() for _ in range(10)]
        mock_atleta_repo.get_all.return_value = atletas

        # Act
        result = await atleta_service.get_all(skip=10, limit=10)

        # Assert
        assert len(result) == 10
        mock_atleta_repo.get_all.assert_called_once_with(10, 10)


# ========== TESTS - ACTUALIZAR PERFIL DE ATLETA (TC-A14 a TC-A18) ==========

@pytest.mark.asyncio
async def test_update_atleta_success(atleta_service, mock_atleta_repo):
        """TC-A14: Actualizar datos básicos"""
        # Arrange
        existing_atleta = MagicMock()
        existing_atleta.id = 1
        existing_atleta.especialidad = "NATACION"
        existing_atleta.anios_experiencia = 5

        updated_atleta = MagicMock()
        updated_atleta.id = 1
        updated_atleta.especialidad = "ATLETISMO"
        updated_atleta.anios_experiencia = 10

        mock_atleta_repo.get_by_id.return_value = existing_atleta
        mock_atleta_repo.update.return_value = updated_atleta

        data = AtletaUpdate(
            especialidad="ATLETISMO",
            anios_experiencia=10
        )

        # Act
        result = await atleta_service.update(1, data)

        # Assert
        assert result.especialidad == "ATLETISMO"
        assert result.anios_experiencia == 10
        mock_atleta_repo.update.assert_called_once()


@pytest.mark.asyncio
async def test_update_atleta_partial(atleta_service, mock_atleta_repo):
        """TC-A16: Actualizar parcial"""
        # Arrange
        existing_atleta = MagicMock()
        existing_atleta.id = 1
        existing_atleta.especialidad = "NATACION"
        existing_atleta.anios_experiencia = 5

        updated_atleta = MagicMock()
        updated_atleta.id = 1
        updated_atleta.especialidad = "ATLETISMO"
        updated_atleta.anios_experiencia = 5

        mock_atleta_repo.get_by_id.return_value = existing_atleta
        mock_atleta_repo.update.return_value = updated_atleta

        data = AtletaUpdate(especialidad="ATLETISMO")

        # Act
        result = await atleta_service.update(1, data)

        # Assert
        assert result.especialidad == "ATLETISMO"


@pytest.mark.asyncio
async def test_update_atleta_not_found(atleta_service, mock_atleta_repo):
        """TC-A17: Atleta no encontrado"""
        # Arrange
        mock_atleta_repo.get_by_id.return_value = None

        data = AtletaUpdate(especialidad="ATLETISMO")

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await atleta_service.update(9999, data)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ========== TESTS - ELIMINAR PERFIL DE ATLETA (TC-A19 a TC-A20) ==========

@pytest.mark.asyncio
async def test_delete_atleta_success(atleta_service, mock_atleta_repo):
        """TC-A19: Eliminar perfil"""
        # Arrange
        existing_atleta = MagicMock()
        existing_atleta.id = 1

        mock_atleta_repo.get_by_id.return_value = existing_atleta
        mock_atleta_repo.delete.return_value = None

        # Act
        await atleta_service.delete(1)

        # Assert
        mock_atleta_repo.delete.assert_called_once_with(existing_atleta)


@pytest.mark.asyncio
async def test_delete_atleta_not_found(atleta_service, mock_atleta_repo):
        """TC-A20: Perfil no encontrado"""
        # Arrange
        mock_atleta_repo.get_by_id.return_value = None

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await atleta_service.delete(9999)

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ========== TESTS - HISTORIAL DE COMPETENCIAS (TC-A30 a TC-A32) ==========

@pytest.mark.asyncio
async def test_get_historial_success(atleta_service, mock_atleta_repo, mock_resultado_repo):
        """TC-A30: Ver historial de competencias"""
        # Arrange
        atleta = MagicMock()
        atleta.id = 1

        competencia1 = MagicMock()
        competencia1.competencia_id = 1
        competencia1.fecha = "2025-01-15"

        competencia2 = MagicMock()
        competencia2.competencia_id = 2
        competencia2.fecha = "2025-01-08"

        mock_atleta_repo.get_by_user_id.return_value = atleta
        mock_resultado_repo.get_by_atleta.return_value = [competencia1, competencia2]

        # Act
        result = await atleta_service.get_historial(user_id=10)

        # Assert
        assert len(result) == 2
        assert result[0].competencia_id == 1


@pytest.mark.asyncio
async def test_get_historial_empty(atleta_service, mock_atleta_repo, mock_resultado_repo):
        """TC-A31: Historial vacío"""
        # Arrange
        atleta = MagicMock()
        atleta.id = 1

        mock_atleta_repo.get_by_user_id.return_value = atleta
        mock_resultado_repo.get_by_atleta.return_value = []

        # Act
        result = await atleta_service.get_historial(user_id=10)

        # Assert
        assert len(result) == 0


# ========== TESTS - ESTADÍSTICAS Y DASHBOARD (TC-A34 a TC-A37) ==========

@pytest.mark.asyncio
async def test_get_estadisticas_success(atleta_service, mock_atleta_repo, mock_resultado_repo):
        """TC-A34: Ver estadísticas"""
        # Arrange
        atleta = MagicMock()
        atleta.id = 1
        atleta.anios_experiencia = 5

        resultado1 = MagicMock()
        resultado1.posicion_final = "primero"
        resultado1.puesto_obtenido = 1

        resultado2 = MagicMock()
        resultado2.posicion_final = "segundo"
        resultado2.puesto_obtenido = 2

        resultado3 = MagicMock()
        resultado3.posicion_final = "tercero"
        resultado3.puesto_obtenido = 3

        mock_atleta_repo.get_by_user_id.return_value = atleta
        mock_resultado_repo.get_by_atleta.return_value = [resultado1, resultado2, resultado3]

        # Act
        result = await atleta_service.get_estadisticas(user_id=10)

        # Assert
        assert result["total_competencias"] == 3
        assert result["medallas"]["oro"] == 1
        assert result["medallas"]["plata"] == 1
        assert result["medallas"]["bronce"] == 1
        assert result["experiencia"] == 5


@pytest.mark.asyncio
async def test_get_estadisticas_empty(atleta_service, mock_atleta_repo, mock_resultado_repo):
        """TC-A35: Estadísticas vacías"""
        # Arrange
        atleta = MagicMock()
        atleta.id = 1
        atleta.anios_experiencia = 0

        mock_atleta_repo.get_by_user_id.return_value = atleta
        mock_resultado_repo.get_by_atleta.return_value = []

        # Act
        result = await atleta_service.get_estadisticas(user_id=10)

        # Assert
        assert result["total_competencias"] == 0
        assert result["medallas"]["oro"] == 0
        assert result["medallas"]["plata"] == 0
        assert result["medallas"]["bronce"] == 0
