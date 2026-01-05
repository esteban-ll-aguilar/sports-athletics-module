import pytest
from unittest.mock import AsyncMock, Mock
from uuid import uuid4
from datetime import date
from types import SimpleNamespace
from fastapi import HTTPException

from app.modules.competencia.services.competencia_service import CompetenciaService
from app.modules.competencia.domain.schemas.competencia_schema import (
    CompetenciaCreate,
    CompetenciaUpdate,
)

# -------------------------
# CREATE
# -------------------------

@pytest.mark.asyncio
async def test_create_competencia_ok():
    repo = Mock()
    repo.create = AsyncMock()

    service = CompetenciaService(repo)

    data = CompetenciaCreate(
        nombre="Competencia Test",
        fecha=date.today(),
        lugar="Estadio"
    )

    competencia_fake = SimpleNamespace(
        nombre=data.nombre,
        fecha=data.fecha,
        lugar=data.lugar,
        entrenador_id=1
    )

    repo.create.return_value = competencia_fake

    result = await service.create(data, entrenador_id=1)

    assert result.nombre == "Competencia Test"
    repo.create.assert_called_once()


# -------------------------
# GET BY ID
# -------------------------

@pytest.mark.asyncio
async def test_get_by_id_ok():
    repo = Mock()
    repo.get_by_id = AsyncMock(return_value=SimpleNamespace(id=1))

    service = CompetenciaService(repo)

    result = await service.get_by_id(1)

    assert result.id == 1
    repo.get_by_id.assert_called_once_with(1)


@pytest.mark.asyncio
async def test_get_by_id_not_found():
    repo = Mock()
    repo.get_by_id = AsyncMock(return_value=None)

    service = CompetenciaService(repo)

    with pytest.raises(HTTPException) as exc:
        await service.get_by_id(999)

    assert exc.value.status_code == 404
    assert exc.value.detail == "Competencia no encontrada"


# -------------------------
# GET BY EXTERNAL ID
# -------------------------

@pytest.mark.asyncio
async def test_get_by_external_id_ok():
    external_id = uuid4()

    repo = Mock()
    repo.get_by_external_id = AsyncMock(
        return_value=SimpleNamespace(external_id=external_id)
    )

    service = CompetenciaService(repo)

    result = await service.get_by_external_id(external_id)

    assert result.external_id == external_id
    repo.get_by_external_id.assert_called_once_with(external_id)


@pytest.mark.asyncio
async def test_get_by_external_id_not_found():
    external_id = uuid4()

    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=None)

    service = CompetenciaService(repo)

    with pytest.raises(HTTPException) as exc:
        await service.get_by_external_id(external_id)

    assert exc.value.status_code == 404
    assert exc.value.detail == "Competencia no encontrada"


# -------------------------
# GET ALL
# -------------------------

@pytest.mark.asyncio
async def test_get_all():
    repo = Mock()
    repo.get_all = AsyncMock(return_value=[])

    service = CompetenciaService(repo)

    result = await service.get_all(
        incluir_inactivos=False,
        entrenador_id=1
    )

    assert result == []
    repo.get_all.assert_called_once_with(False, 1)


# -------------------------
# UPDATE
# -------------------------

@pytest.mark.asyncio
async def test_update_competencia_ok():
    external_id = uuid4()

    competencia = SimpleNamespace(
        nombre="Antigua",
        lugar="X",
        fecha=date.today()
    )

    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=competencia)
    repo.update = AsyncMock(return_value=competencia)

    service = CompetenciaService(repo)

    data = CompetenciaUpdate(nombre="Nueva")

    result = await service.update(external_id, data)

    assert result.nombre == "Nueva"
    repo.update.assert_called_once()


@pytest.mark.asyncio
async def test_update_competencia_not_found():
    external_id = uuid4()

    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=None)

    service = CompetenciaService(repo)

    data = CompetenciaUpdate(nombre="Nueva")

    with pytest.raises(HTTPException) as exc:
        await service.update(external_id, data)

    assert exc.value.status_code == 404


# -------------------------
# COUNT
# -------------------------

@pytest.mark.asyncio
async def test_count():
    repo = Mock()
    repo.count = AsyncMock(return_value=3)

    service = CompetenciaService(repo)

    result = await service.count()

    assert result == 3
    repo.count.assert_called_once()
