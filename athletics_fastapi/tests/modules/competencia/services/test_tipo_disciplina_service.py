"""
Módulo de Pruebas para el Servicio de Tipo de Disciplina.
Verifica la gestión de Tipos de Disciplina (ej. Velocidad, Salto, etc.).
Incluye casos de éxito y manejo de errores (e.g. 404 Not Found).
"""
import pytest
from uuid import uuid4
from unittest.mock import Mock, AsyncMock
from fastapi import HTTPException

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
    """
    Verifica que se llame al repositorio para crear un tipo de disciplina.
    """
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
    """
    Verifica la obtención de un tipo de disciplina por ID.
    """
    repo = Mock()
    external_id = uuid4()
    repo.get = AsyncMock(return_value={"external_id": external_id, "nombre": "Velocidad"})

    service = TipoDisciplinaService(repo)

    result = await service.get_tipo(external_id)

    repo.get.assert_awaited_once_with(external_id)
    assert result["external_id"] == external_id


@pytest.mark.asyncio
async def test_get_tipo_not_found():
    """
    Verifica error 404 al buscar un tipo inexistente.
    """
    repo = Mock()
    repo.get = AsyncMock(return_value=None)

    service = TipoDisciplinaService(repo)

    with pytest.raises(HTTPException) as exc:
        await service.get_tipo(uuid4())
    
    assert exc.value.status_code == 404
    assert exc.value.detail == "Tipo de disciplina no encontrado"


# =========================
# LIST
# =========================

@pytest.mark.asyncio
async def test_get_tipos_ok():
    """
    Verifica el listado de tipos de disciplina.
    """
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
    """
    Verifica la actualización de un tipo de disciplina.
    """
    repo = Mock()
    external_id = uuid4()
    # Mock existencia
    repo.get = AsyncMock(return_value={"external_id": external_id})
    repo.update = AsyncMock(return_value={"external_id": external_id, "nombre": "Fondo"})

    service = TipoDisciplinaService(repo)

    data = TipoDisciplinaUpdate(
        nombre="Fondo",
        descripcion="Pruebas de fondo",
        estado=True
    )

    result = await service.update_tipo(external_id, data)

    repo.get.assert_awaited_once_with(external_id)
    repo.update.assert_awaited_once_with(external_id, data)
    assert result["nombre"] == "Fondo"


@pytest.mark.asyncio
async def test_update_tipo_not_found():
    """
    Verifica error 404 al actualizar un tipo inexistente.
    """
    repo = Mock()
    repo.get = AsyncMock(return_value=None)

    service = TipoDisciplinaService(repo)
    data = TipoDisciplinaUpdate(nombre="Fondo")

    with pytest.raises(HTTPException) as exc:
        await service.update_tipo(uuid4(), data)

    assert exc.value.status_code == 404


# =========================
# DELETE
# =========================

@pytest.mark.asyncio
async def test_delete_tipo_ok():
    """
    Verifica la eliminación de un tipo de disciplina.
    """
    repo = Mock()
    external_id = uuid4()
    # Mock existencia
    repo.get = AsyncMock(return_value={"external_id": external_id})
    repo.delete = AsyncMock(return_value=True)

    service = TipoDisciplinaService(repo)

    result = await service.delete_tipo(external_id)

    repo.get.assert_awaited_once_with(external_id)
    repo.delete.assert_awaited_once_with(external_id)
    assert result is True


@pytest.mark.asyncio
async def test_delete_tipo_not_found():
    """
    Verifica error 404 al eliminar un tipo inexistente.
    """
    repo = Mock()
    repo.get = AsyncMock(return_value=None)

    service = TipoDisciplinaService(repo)

    with pytest.raises(HTTPException) as exc:
        await service.delete_tipo(uuid4())

    assert exc.value.status_code == 404
