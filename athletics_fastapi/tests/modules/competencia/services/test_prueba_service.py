"""
Módulo de Pruebas para el Servicio de Pruebas (Competencias).
Verifica la gestión de pruebas (creación, lectura, actualización) mockeando el repositorio.
Incluye casos de éxito y manejo de errores (e.g. 404 Not Found).
"""
import pytest
from unittest.mock import Mock, AsyncMock, MagicMock
from datetime import date
from fastapi import HTTPException
from types import SimpleNamespace

from app.modules.competencia.services.prueba_service import PruebaService
from app.modules.competencia.domain.schemas.prueba_schema import (
    PruebaCreate,
    PruebaUpdate,
)
from app.modules.competencia.domain.enums.enum import PruebaType


# -----------------------------------------------------------------------------
# CREATE
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_create_prueba_ok():
    """
    Verifica que se llame al repositorio correctamente para crear una prueba.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    
    from types import SimpleNamespace
    prueba_mock = SimpleNamespace()
    prueba_mock.nombre = "Prueba Test"
    prueba_mock.id = 123
    prueba_mock.external_id = "123"
    prueba_repo.create.return_value = prueba_mock

    service = PruebaService(prueba_repo, tipo_disciplina_repo)

    data = PruebaCreate(
        nombre="Prueba Test",
        descripcion="Descripción test",
        siglas="PT",
        fecha_registro=date.today(),
        tipo_prueba=PruebaType.NORMAL,
        tipo_medicion="TIEMPO",
        unidad_medida="SEGUNDOS",
        tipo_disciplina_id=1,
        baremo_id=1,
    )

    result = await service.create_prueba(data)

    prueba_repo.create.assert_awaited_once_with(data)
    assert result.external_id == "123"


# -----------------------------------------------------------------------------
# GET SINGLE
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_get_prueba_ok():
    """
    Verifica la obtención exitosa de una prueba por su ID.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    # Simulamos que devuelve un objeto o dict
    prueba_repo.get_by_external_id.return_value = {"external_id": "123", "nombre": "Existente"}

    service = PruebaService(prueba_repo, tipo_disciplina_repo)

    result = await service.get_prueba("123")

    prueba_repo.get_by_external_id.assert_awaited_once_with("123")
    assert result["external_id"] == "123"


@pytest.mark.asyncio
async def test_get_prueba_not_found():
    """
    Verifica que se lance HTTPException(404) cuando la prueba no existe.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    prueba_repo.get_by_external_id.return_value = None

    service = PruebaService(prueba_repo, tipo_disciplina_repo)

    with pytest.raises(HTTPException) as exc:
        await service.get_prueba("inexistente")
    
    assert exc.value.status_code == 404
    assert exc.value.detail == "Prueba no encontrada"


# -----------------------------------------------------------------------------
# LIST
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_get_pruebas_ok():
    """
    Verifica el listado paginado de pruebas.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    prueba_repo.list.return_value = [{"id": 1}, {"id": 2}]

    service = PruebaService(prueba_repo, tipo_disciplina_repo)
    result = await service.get_pruebas(skip=0, limit=10)

    prueba_repo.list.assert_awaited_once_with(0, 10)
    assert len(result) == 2


# -----------------------------------------------------------------------------
# UPDATE
# -----------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_update_prueba_ok():
    """
    Verifica la actualización de una prueba existente.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    # Mock get_by_external_id() para encontrar la prueba primero
    prueba_repo.get_by_external_id.return_value = {"external_id": "123", "nombre": "Viejo"}
    # Mock update() para devolver la prueba actualizada
    prueba_repo.update.return_value = {"external_id": "123", "nombre": "Nuevo nombre"}

    service = PruebaService(prueba_repo, tipo_disciplina_repo)

    data = PruebaUpdate(nombre="Nuevo nombre")

    result = await service.update_prueba("123", data)

    # Verifica que primero buscó si existía
    prueba_repo.get_by_external_id.assert_awaited_once_with("123")
    # Verifica que llamó a update
    prueba_repo.update.assert_awaited_once_with("123", data)
    assert result["nombre"] == "Nuevo nombre"


@pytest.mark.asyncio
async def test_update_prueba_not_found():
    """
    Verifica que se lance 404 al intentar actualizar una prueba inexistente.
    """
    prueba_repo = AsyncMock()
    tipo_disciplina_repo = AsyncMock()
    # Mock get_by_external_id() devolviendo None
    prueba_repo.get_by_external_id.return_value = None

    service = PruebaService(prueba_repo, tipo_disciplina_repo)

    data = PruebaUpdate(nombre="Imposible")

    with pytest.raises(HTTPException) as exc:
        await service.update_prueba("inexistente", data)
    
    assert exc.value.status_code == 404
    prueba_repo.update.assert_not_called()
