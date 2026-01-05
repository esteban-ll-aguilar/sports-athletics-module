import pytest
from unittest.mock import Mock, AsyncMock
from datetime import date

from app.modules.competencia.services.prueba_service import PruebaService
from app.modules.competencia.domain.schemas.prueba_schema import (
    PruebaCreate,
    PruebaUpdate,
)
from app.modules.competencia.domain.enums.enum import PruebaType


@pytest.mark.asyncio
async def test_create_prueba_ok():
    repo = Mock()
    repo.create = AsyncMock(return_value={"external_id": "123"})

    service = PruebaService(repo)

    data = PruebaCreate(
        nombre="Prueba Test",
        descripcion="Descripción test",
        siglas="PT",
        fecha_registro=date.today(),
        tipo_prueba=PruebaType.NORMAL,  # ✅ AQUÍ ESTÁ LA CORRECCIÓN
        unidad_medida="SEGUNDOS",
        tipo_disciplina_id=1,
        baremo_id=1,
    )

    result = await service.create_prueba(data)

    repo.create.assert_awaited_once_with(data)
    assert result["external_id"] == "123"


@pytest.mark.asyncio
async def test_get_prueba_ok():
    repo = Mock()
    repo.get = AsyncMock(return_value={"external_id": "123"})

    service = PruebaService(repo)

    result = await service.get_prueba("123")

    repo.get.assert_awaited_once_with("123")
    assert result["external_id"] == "123"


@pytest.mark.asyncio
async def test_get_pruebas_ok():
    repo = Mock()
    repo.list = AsyncMock(return_value=[])

    service = PruebaService(repo)

    result = await service.get_pruebas(skip=0, limit=10)

    repo.list.assert_awaited_once_with(0, 10)
    assert result == []


@pytest.mark.asyncio
async def test_update_prueba_ok():
    repo = Mock()
    repo.update = AsyncMock(return_value={"external_id": "123"})

    service = PruebaService(repo)

    data = PruebaUpdate(nombre="Nuevo nombre")

    result = await service.update_prueba("123", data)

    repo.update.assert_awaited_once_with("123", data)
    assert result["external_id"] == "123"
