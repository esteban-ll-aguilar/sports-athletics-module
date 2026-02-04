"""
Módulo de Pruebas para el Repositorio de Competencias.
Prueba las operaciones de persistencia en base de datos para competencias.
"""
import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock, patch

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.competencia.repositories.competencia_repository import (
    CompetenciaRepository
)
from app.modules.competencia.domain.models.competencia_model import Competencia


# ---------------------------------
# Fixtures
# ---------------------------------
@pytest.fixture
def async_session():
    """
    Mock de AsyncSession de SQLAlchemy.
    """
    session = MagicMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    session.add = MagicMock()
    return session


@pytest.fixture
def repository(async_session):
    """
    Fixture del repositorio inyectando la sesión mockeada.
    """
    return CompetenciaRepository(async_session)


# ---------------------------------
# create (FIXED)
# ---------------------------------
@pytest.mark.asyncio
async def test_create_competencia(repository, async_session):
    """
    Verifica la creación exitosa de una competencia.
    """
    data = {
        "nombre": "Competencia Test",
        "estado": True,
        "entrenador_id": 1,
    }

    competencia = await repository.create(data)

    # Verify add was called with a Competencia instance
    async_session.add.assert_called_once()
    args, _ = async_session.add.call_args
    assert isinstance(args[0], Competencia)
    assert args[0].nombre == "Competencia Test"
    
    async_session.commit.assert_called_once()
    # refresh is called in implementation to reload the object from DB
    async_session.refresh.assert_called_once()

    assert competencia.nombre == "Competencia Test"
    assert competencia.estado is True
    assert competencia.entrenador_id == 1


# ---------------------------------
# get_by_id
# ---------------------------------
@pytest.mark.asyncio
async def test_get_by_id_ok(repository, async_session):
    """
    Verifica la recuperación de una competencia por ID numérico.
    """
    competencia = MagicMock(spec=Competencia)

    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = competencia
    async_session.execute.return_value = result_mock

    result = await repository.get_by_id(1)

    assert result == competencia


@pytest.mark.asyncio
async def test_get_by_id_not_found(repository, async_session):
    """
    Verifica que retorne None si la competencia no existe (por ID).
    """
    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = None
    async_session.execute.return_value = result_mock

    result = await repository.get_by_id(999)

    assert result is None


# ---------------------------------
# get_by_external_id
# ---------------------------------
@pytest.mark.asyncio
async def test_get_by_external_id_ok(repository, async_session):
    """
    Verifica la recuperación de una competencia por External ID (UUID).
    """
    competencia = MagicMock(spec=Competencia)

    result_mock = MagicMock()
    result_mock.scalars.return_value.first.return_value = competencia
    async_session.execute.return_value = result_mock

    result = await repository.get_by_external_id(uuid4())

    assert result == competencia


# ---------------------------------
# get_all
# ---------------------------------
@pytest.mark.asyncio
async def test_get_all(repository, async_session):
    """
    Verifica la obtención de todas las competencias.
    """
    competencias = [
        MagicMock(spec=Competencia),
        MagicMock(spec=Competencia),
    ]

    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = competencias
    async_session.execute.return_value = result_mock

    result = await repository.get_all()

    assert result == competencias


@pytest.mark.asyncio
async def test_get_all_filtered(repository, async_session):
    """
    Verifica que se apliquen filtros (ej. inactivos, entrenador_id) al obtener competencias.
    """
    competencias = [MagicMock(spec=Competencia)]

    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = competencias
    async_session.execute.return_value = result_mock

    result = await repository.get_all(
        incluir_inactivos=False,
        entrenador_id=10,
    )

    assert result == competencias


# ---------------------------------
# update
# ---------------------------------
@pytest.mark.asyncio
async def test_update_competencia(repository, async_session):
    """
    Verifica la actualización de los campos de una competencia.
    """
    competencia = Competencia(nombre="Viejo Nombre", estado=True)
    competencia.id = 1

    changes = {
        "nombre": "Nuevo Nombre",
        "estado": False,
    }

    result = await repository.update(competencia, changes)

    assert competencia.nombre == "Nuevo Nombre"
    assert competencia.estado is False
    async_session.commit.assert_called_once()
    # refresh is called in implementation to reload the object from DB
    async_session.refresh.assert_called_once_with(competencia)
    assert result == competencia


# ---------------------------------
# delete
# ---------------------------------
@pytest.mark.asyncio
async def test_delete_ok(repository, async_session):
    """
    Verifica la eliminación exitosa de una competencia.
    """
    competencia = MagicMock(spec=Competencia)
    repository.get_by_id = AsyncMock(return_value=competencia)

    result = await repository.delete(1)

    async_session.delete.assert_called_once_with(competencia)
    async_session.commit.assert_called_once()
    assert result is True


@pytest.mark.asyncio
async def test_delete_not_found(repository):
    """
    Verifica que devuelva False si se intenta eliminar una competencia inexistente.
    """
    repository.get_by_id = AsyncMock(return_value=None)

    result = await repository.delete(999)

    assert result is False


# ---------------------------------
# count
# ---------------------------------
@pytest.mark.asyncio
async def test_count(repository, async_session):
    """
    Verifica el conteo total de competencias.
    """
    result_mock = MagicMock()
    result_mock.scalar.return_value = 3
    async_session.execute.return_value = result_mock

    result = await repository.count()

    assert result == 3
