"""
Módulo de Pruebas para el Servicio de Baremos.
Prueba la lógica de negocio asociada a la gestión de Baremos.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from types import SimpleNamespace
from fastapi import HTTPException

from app.modules.competencia.services.baremo_service import BaremoService
from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate,
    BaremoUpdate,
)
from app.modules.competencia.domain.schemas.item_baremo_schema import ItemBaremoCreate
from app.modules.competencia.domain.enums.enum import Sexo


@pytest.mark.asyncio
async def test_create_baremo_ok():
    """
    Verifica que se llame correctamente al repositorio al crear un baremo.
    """
    baremo_repo = AsyncMock()
    prueba_repo = AsyncMock()

    service = BaremoService(baremo_repo, prueba_repo)

    prueba_uuid = uuid4()
    prueba_repo.get_by_external_id.return_value = MagicMock(id=1)

    data = BaremoCreate(
        sexo=Sexo.M,
        edad_min=18,
        edad_max=25,
        estado=True,
        prueba_id=prueba_uuid,
        items=[
            ItemBaremoCreate(
                clasificacion="A",
                marca_minima=10.0,
                marca_maxima=12.0,
                estado=True
            )
        ]
    )

    baremo_fake = SimpleNamespace(
        sexo=Sexo.M,
        edad_min=18,
        edad_max=25,
        estado=True
    )

    baremo_repo.create.return_value = baremo_fake

    result = await service.create(data)

    assert result.sexo == Sexo.M
    assert result.edad_min == 18
    baremo_repo.create.assert_called_once()


@pytest.mark.asyncio
async def test_update_baremo_ok():
    """
    Verifica que se pueda actualizar un baremo existente.
    """
    external_id = uuid4()

    baremo = MagicMock()
    baremo.sexo = Sexo.M
    baremo.edad_min = 18
    baremo.edad_max = 25
    baremo.estado = True

    baremo_repo = AsyncMock()
    prueba_repo = AsyncMock()
    baremo_repo.get_by_external_id.return_value = baremo
    
    # Mock update to return the baremo with updated values
    updated_baremo = MagicMock()
    updated_baremo.sexo = Sexo.M
    updated_baremo.edad_min = 20
    updated_baremo.edad_max = 25
    updated_baremo.estado = True
    baremo_repo.update.return_value = updated_baremo

    service = BaremoService(baremo_repo, prueba_repo)

    data = BaremoUpdate(edad_min=20)

    result = await service.update(external_id, data)

    assert result.edad_min == 20
    baremo_repo.update.assert_called_once()


@pytest.mark.asyncio
async def test_update_baremo_not_found():
    """
    Verifica que se lance un error 404 si se intenta actualizar un baremo inexistente.
    """
    baremo_repo = AsyncMock()
    prueba_repo = AsyncMock()
    baremo_repo.get_by_external_id.return_value = None

    service = BaremoService(baremo_repo, prueba_repo)

    with pytest.raises(HTTPException) as exc:
        await service.update(uuid4(), BaremoUpdate(valor_baremo=10))

    assert exc.value.status_code == 404
