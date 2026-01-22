"""
Pruebas Unitarias para HistorialMedicoService.
Verifica la lógica de negocio para la gestión del historial médico de atletas.
Cubre todos los casos de prueba: TC-A21 a TC-A29
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from fastapi import HTTPException, status
from app.modules.atleta.services.historial_medico_service import HistorialMedicoService
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
    TipoAlergia,
    TipoEnfermedadHereditaria,
    TipoEnfermedad
)
from app.modules.auth.domain.enums import RoleEnum


# ========== FIXTURES ==========

@pytest.fixture
def mock_db():
    """Mock para la sesión de base de datos"""
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.execute = AsyncMock()
    return db


@pytest.fixture
def historial_service(mock_db):
    """Instancia del servicio con dependencias mockeadas"""
    return HistorialMedicoService(db=mock_db)


# ========== TESTS - CREAR HISTORIAL MÉDICO (TC-A21 a TC-A23) ==========

@pytest.mark.asyncio
async def test_create_historial_calculo_automatico_imc(historial_service, mock_db):
    """TC-A21: Cálculo automático del IMC"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.role = RoleEnum.ATLETA

    # Crear mocks para cada query ejecutable
    user_result = MagicMock()
    user_result.scalar_one_or_none = MagicMock(return_value=user)
    
    atleta = MagicMock()
    atleta.id = 1
    atleta.user_id = 10
    atleta_result = MagicMock()
    atleta_result.scalar_one_or_none = MagicMock(return_value=atleta)
    
    no_historial_result = MagicMock()
    no_historial_result.scalar_one_or_none = MagicMock(return_value=None)

    # IMC = peso / (talla ^ 2) = 70 / (1.75 ^ 2) = 22.86
    data = HistorialMedicoCreate(
        peso=70.0,
        talla=1.75,
        frecuencia_cardiaca_reposo=60,
        presion_arterial_sistolica=120,
        presion_arterial_diastolica=80,
        lesiones_actuales=[],
        alergias=TipoAlergia.NINGUNA,
        enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
        enfermedades=TipoEnfermedad.NINGUNA
    )

    # Configurar execute para retornar diferentes resultados en cada llamada
    mock_db.execute.side_effect = [user_result, atleta_result, no_historial_result]

    # Act
    result = await historial_service.create(data, user_id=10)

    # Assert
    assert result.imc == pytest.approx(22.86, 0.01)
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_create_historial_user_not_atleta(historial_service, mock_db):
    """TC-A22: Usuario no es ATLETA"""
    # Arrange
    no_user_result = MagicMock()
    no_user_result.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.return_value = no_user_result
    data = HistorialMedicoCreate(
        peso=70.0,
        talla=1.75,
        frecuencia_cardiaca_reposo=60,
        presion_arterial_sistolica=120,
        presion_arterial_diastolica=80,
        lesiones_actuales=[],
        alergias=TipoAlergia.NINGUNA,
        enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
        enfermedades=TipoEnfermedad.NINGUNA
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await historial_service.create(data, user_id=10)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_create_historial_already_exists(historial_service, mock_db):
    """TC-A23: Historial duplicado"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.role = RoleEnum.ATLETA

    existing_historial = MagicMock()
    existing_historial.external_id = "550e8400-e29b-41d4-a716-446655440001"

    user_result = MagicMock()
    user_result.scalar_one_or_none = MagicMock(return_value=user)

    atleta = MagicMock()
    atleta.id = 1
    atleta.user_id = 10
    atleta_result = MagicMock()
    atleta_result.scalar_one_or_none = MagicMock(return_value=atleta)

    historial_result = MagicMock()
    historial_result.scalar_one_or_none = MagicMock(return_value=existing_historial)

    mock_db.execute.side_effect = [user_result, atleta_result, historial_result]
    data = HistorialMedicoCreate(
        peso=70.0,
        talla=1.75,
        frecuencia_cardiaca_reposo=60,
        presion_arterial_sistolica=120,
        presion_arterial_diastolica=80,
        lesiones_actuales=[],
        alergias=TipoAlergia.NINGUNA,
        enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
        enfermedades=TipoEnfermedad.NINGUNA
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await historial_service.create(data, user_id=10)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


# ========== TESTS - LEER HISTORIAL MÉDICO (TC-A24 a TC-A25) ==========

@pytest.mark.asyncio
async def test_get_historial_ok(historial_service, mock_db):
    """TC-A24: Obtener historial por external_id"""
    # Arrange
    expected_historial = MagicMock()
    expected_historial.external_id = "550e8400-e29b-41d4-a716-446655440000"
    expected_historial.peso = 70.0
    expected_historial.talla = 1.75
    expected_historial.imc = 22.86

    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=expected_historial)
    mock_db.execute.return_value = result_mock

    # Act
    result = await historial_service.get(external_id="550e8400-e29b-41d4-a716-446655440000")

    # Assert
    assert result.external_id == "550e8400-e29b-41d4-a716-446655440000"
    assert result.peso == 70.0

@pytest.mark.asyncio
async def test_get_historial_not_found(historial_service, mock_db):
    """TC-A25: Historial no encontrado"""
    # Arrange
    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.return_value = result_mock

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await historial_service.get(external_id="nonexistent")

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ========== TESTS - LEER HISTORIAL POR USUARIO (TC-A26 a TC-A27) ==========

@pytest.mark.asyncio
@pytest.mark.asyncio
async def test_get_by_user_ok(historial_service, mock_db):
    """TC-A26: Obtener historial por user_id"""
    # Arrange
    expected_historial = MagicMock()
    expected_historial.id = 1
    expected_historial.user_id = 10
    expected_historial.peso = 70.0

    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=expected_historial)
    mock_db.execute.return_value = result_mock

    # Act
    result = await historial_service.get_by_user(user_id=10)

    # Assert
    assert result.id == 1
    assert result.user_id == 10
    assert result.peso == 70.0


@pytest.mark.asyncio
async def test_get_by_user_not_found(historial_service, mock_db):
    """TC-A27: Usuario no tiene historial"""
    # Arrange
    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.return_value = result_mock

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await historial_service.get_by_user(user_id=999)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ========== TESTS - LISTAR HISTORIALES (TC-A28) ==========

@pytest.mark.asyncio
async def test_get_all_historiales(historial_service, mock_db):
    """TC-A28: Listar todos los historiales"""
    # Arrange
    historial1 = MagicMock()
    historial1.external_id = "550e8400-e29b-41d4-a716-446655440000"
    historial1.peso = 70.0

    historial2 = MagicMock()
    historial2.external_id = "550e8400-e29b-41d4-a716-446655440001"
    historial2.peso = 65.0

    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.all = MagicMock(return_value=[historial1, historial2])
    result_mock.scalars = MagicMock(return_value=scalars_mock)
    mock_db.execute.return_value = result_mock

    # Act
    result = await historial_service.get_all(skip=0, limit=100)

@pytest.mark.asyncio
async def test_get_all_pagination(historial_service, mock_db):
    """TC-A28b: Paginación en listado"""
    # Arrange
    historiales = [MagicMock() for _ in range(10)]
    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.all = MagicMock(return_value=historiales)
    result_mock.scalars = MagicMock(return_value=scalars_mock)
    mock_db.execute.return_value = result_mock

    # Act
    result = await historial_service.get_all(skip=10, limit=10)

    # Assert
    assert len(result) == 10


@pytest.mark.asyncio
async def test_get_all_empty(historial_service, mock_db):
    """TC-A28c: Lista vacía"""
    # Arrange
    result_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.all = MagicMock(return_value=[])
    result_mock.scalars = MagicMock(return_value=scalars_mock)
    mock_db.execute.return_value = result_mock

    # Act
    result = await historial_service.get_all(skip=0, limit=100)

    # Assert
    assert len(result) == 0


# ========== TESTS - ACTUALIZAR HISTORIAL MÉDICO (TC-A29) ==========

@pytest.mark.asyncio
async def test_update_historial_ok(historial_service, mock_db):
    """TC-A29: Actualizar historial médico"""
    # Arrange
    existing_historial = MagicMock()
    existing_historial.external_id = "550e8400-e29b-41d4-a716-446655440000"
    existing_historial.peso = 70.0
    existing_historial.talla = 1.75
    existing_historial.imc = 22.86

    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=existing_historial)
    mock_db.execute.return_value = result_mock

    data = HistorialMedicoUpdate(
    peso=72.0,
    talla=1.75,
    frecuencia_cardiaca_reposo=65
    )

    # Act
    result = await historial_service.update(
    external_id="550e8400-e29b-41d4-a716-446655440000",
    data=data
    )

    # Assert
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_historial_not_found(historial_service, mock_db):
    """TC-A29b: Historial no encontrado para actualizar"""
    # Arrange
    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.return_value = result_mock

    data = HistorialMedicoUpdate(
    peso=72.0,
    talla=1.75
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await historial_service.update(
            external_id="nonexistent",
            data=data
        )

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


# ========== TESTS - VALIDACIONES ADICIONALES ==========

@pytest.mark.asyncio
async def test_imc_calculation_edge_cases(historial_service, mock_db):
    """Validar cálculo de IMC con valores edge case"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.role = RoleEnum.ATLETA

    test_cases = [
    {"peso": 50.0, "talla": 1.50, "expected_imc": 22.22},
    {"peso": 100.0, "talla": 2.00, "expected_imc": 25.0},
    {"peso": 65.0, "talla": 1.65, "expected_imc": 23.88},
    ]

    for case in test_cases:
        data = HistorialMedicoCreate(
            peso=case["peso"],
            talla=case["talla"],
            frecuencia_cardiaca_reposo=60,
            presion_arterial_sistolica=120,
            presion_arterial_diastolica=80,
            lesiones_actuales=[],
            alergias=TipoAlergia.NINGUNA,
            enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
            enfermedades=TipoEnfermedad.NINGUNA
        )

    user_result = MagicMock()
    user_result.scalar_one_or_none = MagicMock(return_value=user)
    
    atleta = MagicMock()
    atleta.id = 1
    atleta.user_id = 10
    atleta_result = MagicMock()
    atleta_result.scalar_one_or_none = MagicMock(return_value=atleta)
    
    no_historial_result = MagicMock()
    no_historial_result.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.side_effect = [user_result, atleta_result, no_historial_result]

    # Act
    result = await historial_service.create(data, user_id=10)

    # Assert
    expected_imc = case["peso"] / (case["talla"] ** 2)
    assert result.imc == pytest.approx(expected_imc, 0.01)


@pytest.mark.asyncio
async def test_create_historial_with_all_fields(historial_service, mock_db):
    """Validar creación con todos los campos completos"""
    # Arrange
    user = MagicMock()
    user.id = 10
    user.role = RoleEnum.ATLETA

    user_result = MagicMock()
    user_result.scalar_one_or_none = MagicMock(return_value=user)
    
    atleta = MagicMock()
    atleta.id = 1
    atleta.user_id = 10
    atleta_result = MagicMock()
    atleta_result.scalar_one_or_none = MagicMock(return_value=atleta)
    
    no_historial_result = MagicMock()
    no_historial_result.scalar_one_or_none = MagicMock(return_value=None)
    mock_db.execute.side_effect = [user_result, atleta_result, no_historial_result]

    data = HistorialMedicoCreate(
    peso=70.0,
    talla=1.75,
    frecuencia_cardiaca_reposo=60,
    presion_arterial_sistolica=120,
    presion_arterial_diastolica=80,
    lesiones_actuales=["Esguince de tobillo"],
    alergias=TipoAlergia.NINGUNA,
    enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
    enfermedades=TipoEnfermedad.NINGUNA
    )

    # Act
    result = await historial_service.create(data, user_id=10)

    # Assert
    assert result.peso == 70.0
    assert result.talla == 1.75
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_partial_fields(historial_service, mock_db):
    """Validar actualización parcial de campos"""
    # Arrange
    existing_historial = MagicMock()
    existing_historial.external_id = "550e8400-e29b-41d4-a716-446655440000"
    existing_historial.peso = 70.0
    existing_historial.talla = 1.75
    existing_historial.imc = 22.86
    existing_historial.frecuencia_cardiaca_reposo = 60

    result_mock = MagicMock()
    result_mock.scalar_one_or_none = MagicMock(return_value=existing_historial)
    mock_db.execute.return_value = result_mock

    data = HistorialMedicoUpdate(
    peso=72.0
    )

    # Act
    result = await historial_service.update(
    external_id="550e8400-e29b-41d4-a716-446655440000",
    data=data
    )

    # Assert
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()
