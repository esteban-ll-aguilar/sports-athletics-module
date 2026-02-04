"""
Módulo de Pruebas para el Servicio de Resultados de Competencia.
Verifica la lógica de negocio para registrar y consultar resultados de los atletas en competencias.
"""
import pytest
from uuid import uuid4
from types import SimpleNamespace
from unittest.mock import Mock, AsyncMock, patch
from fastapi import HTTPException

from app.modules.competencia.services.resultado_competencia_service import (
    ResultadoCompetenciaService
)
from app.modules.competencia.domain.schemas.competencia_schema import (
    ResultadoCompetenciaCreate,
    ResultadoCompetenciaUpdate,
)


# =========================
# CREATE
# =========================

@pytest.mark.asyncio
async def test_create_resultado_ok():
    """
    Verifica la creación exitosa de un resultado de competencia.
    Mockea los repositorios de competencia, atleta y prueba para asegurar validaciones.
    """
    repo = Mock()
    repo.create = AsyncMock()

    competencia_repo = Mock()
    atleta_repo = Mock()
    prueba_repo = Mock()

    competencia = SimpleNamespace(id=1)
    atleta = SimpleNamespace(id=2, user_id=10)  # Add user_id
    prueba = SimpleNamespace(id=3)

    competencia_repo.get_by_external_id = AsyncMock(return_value=competencia)
    atleta_repo.get_by_external_id = AsyncMock(return_value=atleta)
    prueba_repo.get_by_external_id = AsyncMock(return_value=prueba)

    resultado_fake = SimpleNamespace(resultado=10.5)
    repo.create.return_value = resultado_fake

    service = ResultadoCompetenciaService(
        repo, competencia_repo, atleta_repo, prueba_repo
    )

    data = ResultadoCompetenciaCreate(
        # IDs externos (UUIDs)
        competencia_id=uuid4(),
        atleta_id=uuid4(),
        prueba_id=uuid4(),
        

        # Datos del resultado
        resultado=10.5,
        unidad_medida="SEGUNDOS",
        posicion_final="1",    
        puesto_obtenido=1,
        observaciones="Buen resultado",
        estado=True,
    )

    result = await service.create(data, entrenador_id=99)

    repo.create.assert_awaited_once()
    assert result == resultado_fake


@pytest.mark.asyncio
async def test_create_resultado_competencia_not_found():
    """
    Verifica que falle si la competencia asociada no existe.
    """
    repo = Mock()
    competencia_repo = Mock()
    atleta_repo = Mock()
    prueba_repo = Mock()

    competencia_repo.get_by_external_id = AsyncMock(return_value=None)

    service = ResultadoCompetenciaService(
        repo, competencia_repo, atleta_repo, prueba_repo
    )

    data = ResultadoCompetenciaCreate(
        competencia_id=uuid4(),
        atleta_id=uuid4(),
        prueba_id=uuid4(),
        resultado=10.5,
        unidad_medida="SEGUNDOS",
        posicion_final="1",      # ✅ STRING (CORRECCIÓN)
        puesto_obtenido=1,
        observaciones=None,
        estado=True,
    )

    with pytest.raises(HTTPException) as exc:
        await service.create(data, entrenador_id=1)

    assert exc.value.status_code == 404
    assert exc.value.detail == "Competencia no encontrada"


# =========================
# GET BY EXTERNAL ID
# =========================

@pytest.mark.asyncio
async def test_get_by_external_id_ok():
    """
    Verifica la obtención de un resultado por ID externo.
    """
    repo = Mock()
    resultado = SimpleNamespace(external_id=uuid4())
    repo.get_by_external_id = AsyncMock(return_value=resultado)

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    result = await service.get_by_external_id(resultado.external_id)

    repo.get_by_external_id.assert_awaited_once_with(resultado.external_id)
    assert result == resultado


@pytest.mark.asyncio
async def test_get_by_external_id_not_found():
    """
    Verifica el error 404 al buscar un resultado inexistente.
    """
    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=None)

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    with pytest.raises(HTTPException) as exc:
        await service.get_by_external_id(uuid4())

    assert exc.value.status_code == 404
    assert exc.value.detail == "Resultado no encontrado"


# =========================
# GET BY COMPETENCIA
# =========================

@pytest.mark.asyncio
async def test_get_by_competencia_external_id_ok():
    """
    Verifica la obtención de resultados asociados a una competencia específica.
    """
    repo = Mock()
    competencia_repo = Mock()

    competencia = SimpleNamespace(id=1)
    resultados = []

    competencia_repo.get_by_external_id = AsyncMock(return_value=competencia)
    repo.get_by_competencia = AsyncMock(return_value=resultados)

    service = ResultadoCompetenciaService(
        repo, competencia_repo, Mock(), Mock()
    )

    result = await service.get_by_competencia_external_id(uuid4())

    assert result == resultados


@pytest.mark.asyncio
async def test_get_by_competencia_external_id_not_found():
    """
    Verifica que falle si la competencia no existe.
    """
    repo = Mock()
    competencia_repo = Mock()
    competencia_repo.get_by_external_id = AsyncMock(return_value=None)

    service = ResultadoCompetenciaService(
        repo, competencia_repo, Mock(), Mock()
    )

    with pytest.raises(HTTPException) as exc:
        await service.get_by_competencia_external_id(uuid4())

    assert exc.value.status_code == 404
    assert exc.value.detail == "Competencia no encontrada"


# =========================
# UPDATE
# =========================

@pytest.mark.asyncio
async def test_update_resultado_ok():
    """
    Verifica la actualización de un resultado existente.
    """
    repo = Mock()
    resultado = SimpleNamespace(resultado=10.5)

    repo.get_by_external_id = AsyncMock(return_value=resultado)
    repo.update = AsyncMock(return_value=resultado)

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    data = ResultadoCompetenciaUpdate(resultado=11.2)

    result = await service.update(uuid4(), data)

    repo.update.assert_awaited_once_with(resultado)
    assert result.resultado == 11.2


# =========================
# COUNT
# =========================

@pytest.mark.asyncio
async def test_count():
    """
    Verifica el conteo de resultados.
    """
    repo = Mock()
    repo.count = AsyncMock(return_value=5)

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    result = await service.count()

    assert result == 5


@pytest.mark.asyncio
async def test_create_resultado_atleta_not_found_by_external_id_but_by_user():
    """
    Verifica creación cuando atleta no se encuentra por external_id pero sí por user external_id.
    """
    repo = Mock()
    repo.create = AsyncMock()
    repo.session = Mock()

    competencia_repo = Mock()
    atleta_repo = Mock()
    prueba_repo = Mock()
    user_repo_mock = Mock()

    competencia = SimpleNamespace(id=1)
    atleta = SimpleNamespace(id=2, user_id=10)
    prueba = SimpleNamespace(id=3)
    user = SimpleNamespace(id=10)

    competencia_repo.get_by_external_id = AsyncMock(return_value=competencia)
    atleta_repo.get_by_external_id = AsyncMock(return_value=None)  # Not found by external_id
    atleta_repo.get_by_user_id = AsyncMock(return_value=atleta)  # Found by user_id
    prueba_repo.get_by_external_id = AsyncMock(return_value=prueba)

    # Mock the AuthUsersRepository
    with patch('app.modules.auth.repositories.auth_users_repository.AuthUsersRepository') as mock_auth_repo_class:
        mock_auth_repo_class.return_value = user_repo_mock
        user_repo_mock.get_by_external_id = AsyncMock(return_value=user)

        resultado_fake = SimpleNamespace(resultado=10.5)
        repo.create.return_value = resultado_fake

        service = ResultadoCompetenciaService(
            repo, competencia_repo, atleta_repo, prueba_repo
        )

        data = ResultadoCompetenciaCreate(
            competencia_id=uuid4(),
            atleta_id=uuid4(),
            prueba_id=uuid4(),
            resultado=10.5,
            unidad_medida="SEGUNDOS",
            posicion_final="1",
            puesto_obtenido=1,
            observaciones="Excelente",
            estado=True
        )

        result = await service.create(data, entrenador_id=1)

        assert result == resultado_fake


@pytest.mark.asyncio
async def test_create_resultado_atleta_not_found():
    """
    Verifica error cuando atleta no se encuentra ni por external_id ni por user.
    """
    repo = Mock()
    repo.session = Mock()

    competencia_repo = Mock()
    atleta_repo = Mock()
    prueba_repo = Mock()
    user_repo_mock = Mock()

    competencia = SimpleNamespace(id=1)
    prueba = SimpleNamespace(id=3)

    competencia_repo.get_by_external_id = AsyncMock(return_value=competencia)
    atleta_repo.get_by_external_id = AsyncMock(return_value=None)
    prueba_repo.get_by_external_id = AsyncMock(return_value=prueba)

    with patch('app.modules.auth.repositories.auth_users_repository.AuthUsersRepository') as mock_auth_repo_class:
        mock_auth_repo_class.return_value = user_repo_mock
        user_repo_mock.get_by_external_id = AsyncMock(return_value=None)  # User not found

        service = ResultadoCompetenciaService(
            repo, competencia_repo, atleta_repo, prueba_repo
        )

        data = ResultadoCompetenciaCreate(
            competencia_id=uuid4(),
            atleta_id=uuid4(),
            prueba_id=uuid4(),
            resultado=10.5,
            unidad_medida="SEGUNDOS",
            posicion_final="1",
            puesto_obtenido=1,
            observaciones="Excelente",
            estado=True
        )

        with pytest.raises(HTTPException) as exc_info:
            await service.create(data, entrenador_id=1)

        assert exc_info.value.status_code == 404
        assert "Atleta no encontrado" in exc_info.value.detail


@pytest.mark.asyncio
async def test_create_resultado_prueba_not_found():
    """
    Verifica error cuando prueba no se encuentra.
    """
    repo = Mock()

    competencia_repo = Mock()
    atleta_repo = Mock()
    prueba_repo = Mock()

    competencia = SimpleNamespace(id=1)
    atleta = SimpleNamespace(id=2, user_id=10)

    competencia_repo.get_by_external_id = AsyncMock(return_value=competencia)
    atleta_repo.get_by_external_id = AsyncMock(return_value=atleta)
    prueba_repo.get_by_external_id = AsyncMock(return_value=None)

    service = ResultadoCompetenciaService(
        repo, competencia_repo, atleta_repo, prueba_repo
    )

    data = ResultadoCompetenciaCreate(
        competencia_id=uuid4(),
        atleta_id=uuid4(),
        prueba_id=uuid4(),
        resultado=10.5,
        unidad_medida="SEGUNDOS",
        posicion_final="1ro",
        puesto_obtenido=1,
        observaciones="Excelente",
        estado=True
    )

    with pytest.raises(HTTPException) as exc_info:
        await service.create(data, entrenador_id=1)

    assert exc_info.value.status_code == 404
    assert "Prueba no encontrada" in exc_info.value.detail


@pytest.mark.asyncio
async def test_get_all():
    """
    Verifica obtención de todos los resultados.
    """
    repo = Mock()
    repo.get_all = AsyncMock(return_value=[])

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    result = await service.get_all()

    assert result == []
    repo.get_all.assert_called_once_with(True, None)


@pytest.mark.asyncio
async def test_get_all_with_params():
    """
    Verifica obtención de todos los resultados con parámetros.
    """
    repo = Mock()
    repo.get_all = AsyncMock(return_value=[])

    service = ResultadoCompetenciaService(
        repo, Mock(), Mock(), Mock()
    )

    result = await service.get_all(incluir_inactivos=False, entrenador_id=1)

    assert result == []
    repo.get_all.assert_called_once_with(False, 1)
