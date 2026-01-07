"""
Módulo de Pruebas para el Servicio de Baremos.
Prueba la lógica de negocio asociada a la gestión de Baremos.
"""
import pytest
from unittest.mock import AsyncMock, Mock
from uuid import uuid4
from types import SimpleNamespace
from fastapi import HTTPException

from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate,
    BaremoUpdate,
)


@pytest.mark.asyncio
async def test_create_baremo_ok():
    """
    Verifica que se llame correctamente al repositorio al crear un baremo.
    """
    repo = Mock()
    repo.create = AsyncMock()

    service = BaremoService(repo)

    data = BaremoCreate(
        valor_baremo=10,
        clasificacion="A",
        estado=True
    )

    baremo_fake = SimpleNamespace(
        valor_baremo=10,
        clasificacion="A",
        estado=True
    )

    repo.create.return_value = baremo_fake

    result = await service.create(data)

    assert result.valor_baremo == 10
    assert result.clasificacion == "A"
    repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_update_baremo_ok():
    """
    Verifica que se pueda actualizar un baremo existente.
    """
    external_id = uuid4()

    baremo = SimpleNamespace(
        valor_baremo=5,
        clasificacion="B",
        estado=True
    )

    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=baremo)
    repo.update = AsyncMock(return_value=baremo)

    service = BaremoService(repo)

    data = BaremoUpdate(valor_baremo=20)

    result = await service.update(external_id, data)

    assert result.valor_baremo == 20
    repo.update.assert_called_once()


@pytest.mark.asyncio
async def test_update_baremo_not_found():
    """
    Verifica que se lance un error 404 si se intenta actualizar un baremo inexistente.
    """
    repo = Mock()
    repo.get_by_external_id = AsyncMock(return_value=None)

    service = BaremoService(repo)

    with pytest.raises(HTTPException) as exc:
        await service.update(uuid4(), BaremoUpdate(valor_baremo=10))

    assert exc.value.status_code == 404
