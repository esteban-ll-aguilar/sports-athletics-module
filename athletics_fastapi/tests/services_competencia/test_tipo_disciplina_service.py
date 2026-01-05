import pytest
from uuid import uuid4
from unittest.mock import Mock, AsyncMock

from app.modules.competencia.services.tipo_disciplina_service import (
    TipoDisciplinaService
)
from app.modules.competencia.domain.schemas.tipo_disciplina_schema import (
    TipoDisciplinaCreate,
    TipoDisciplinaUpdate,
)


# =========================
# CREATE
# =========================

@pytest.mark.asyncio
async def test_create_tipo_ok():
    repo = Mock()
    repo.create = AsyncMock(return_value={"external_id": uuid4()})

    service = TipoDisciplinaService(repo)

    data = TipoDisciplinaCreate(
        nombre="Velocidad",
        descripcion="Pruebas de velocidad",
        estado=True
    )

    result = await service.create_tipo(data)

    repo.create.assert_awaited_once_with(data)
    assert "external_id" in result


# =========================
# GET BY EXTERNAL ID
# =========================

@pytest.mark.asyncio
async def test_get_tipo_ok():
    repo = Mock()
    external_id = uuid4()
    repo.get = AsyncMock(return_value={"external_id": external_id})

    service = TipoDisciplinaService(repo)

    result = await service.get_tipo(external_id)

    repo.get.assert_awaited_once_with(external_id)
    assert result["external_id"] == external_id


# =========================
# LIST
# =========================

@pytest.mark.asyncio
async def test_get_tipos_ok():
    repo = Mock()
    repo.list = AsyncMock(return_value=[])

    service = TipoDisciplinaService(repo)

    result = await service.get_tipos(skip=0, limit=10)

    repo.list.assert_awaited_once_with(0, 10)
    assert result == []


# =========================
# UPDATE
# =========================

@pytest.mark.asyncio
async def test_update_tipo_ok():
    repo = Mock()
    external_id = uuid4()
    repo.update = AsyncMock(return_value={"external_id": external_id})

    service = TipoDisciplinaService(repo)

    data = TipoDisciplinaUpdate(
        nombre="Fondo",
        descripcion="Pruebas de fondo",
        estado=True
    )

    result = await service.update_tipo(external_id, data)

    repo.update.assert_awaited_once_with(external_id, data)
    assert result["external_id"] == external_id


# =========================
# DELETE
# =========================

@pytest.mark.asyncio
async def test_delete_tipo_ok():
    repo = Mock()
    external_id = uuid4()
    repo.delete = AsyncMock(return_value=True)

    service = TipoDisciplinaService(repo)

    result = await service.delete_tipo(external_id)

    repo.delete.assert_awaited_once_with(external_id)
    assert result is True
