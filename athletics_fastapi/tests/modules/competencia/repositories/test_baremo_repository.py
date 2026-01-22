"""
Módulo de Pruebas para el Repositorio de Baremos.
Verifica las operaciones CRUD (crear, leer, actualizar) en la base de datos para la entidad Baremo.
"""
import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

from app.modules.competencia.domain.models.baremo_model import Baremo
from app.modules.competencia.repositories.baremo_repository import BaremoRepository


# -----------------------------------
# Fixture AsyncSession mockeada
# -----------------------------------
@pytest.fixture
def db():
    """
    Mock de la sesión de base de datos asíncrona.
    """
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.execute = AsyncMock()
    return session


# -----------------------------------
# create()
# -----------------------------------
@pytest.mark.asyncio
async def test_create_baremo_ok(db):
    """
    Verifica que se pueda crear un baremo correctamente.
    """
    repo = BaremoRepository(db)

    # ❌ No usar campos inexistentes como "nombre"
    baremo = Baremo()
    
    # Mock get_by_external_id since create calls it at the end
    repo.get_by_external_id = AsyncMock(return_value=baremo)

    result = await repo.create(baremo)

    db.add.assert_called_once_with(baremo)
    db.commit.assert_awaited_once()
    db.refresh.assert_awaited_once_with(baremo)
    assert result == baremo


# -----------------------------------
# get_all() - incluye inactivos
# -----------------------------------
@pytest.mark.asyncio
async def test_get_all_baremos_incluye_inactivos(db):
    """
    Verifica que se recuperen todos los baremos, incluyendo los inactivos.
    """
    repo = BaremoRepository(db)

    baremos = [Baremo(), Baremo()]

    db.execute.return_value = MagicMock(
        scalars=lambda: MagicMock(all=lambda: baremos)
    )

    result = await repo.get_all()

    assert len(result) == 2


# -----------------------------------
# get_all() - solo activos
# -----------------------------------
@pytest.mark.asyncio
async def test_get_all_baremos_solo_activos(db):
    """
    Verifica el filtrado de baremos para obtener solo los activos.
    """
    repo = BaremoRepository(db)

    baremos = [Baremo(estado=True)]

    db.execute.return_value = MagicMock(
        scalars=lambda: MagicMock(all=lambda: baremos)
    )

    result = await repo.get_all(incluir_inactivos=False)

    assert all(b.estado for b in result)


# -----------------------------------
# get_by_external_id() encontrado
# -----------------------------------
@pytest.mark.asyncio
async def test_get_baremo_by_external_id_ok(db):
    """
    Verifica la recuperación de un baremo por su ID externo (UUID).
    """
    repo = BaremoRepository(db)

    baremo = Baremo(external_id=uuid4())

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: baremo
    )

    result = await repo.get_by_external_id(baremo.external_id)

    assert result == baremo


# -----------------------------------
# get_by_external_id() no encontrado
# -----------------------------------
@pytest.mark.asyncio
async def test_get_baremo_by_external_id_not_found(db):
    """
    Verifica que devuelva None si no se encuentra el baremo por ID externo.
    """
    repo = BaremoRepository(db)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: None
    )

    result = await repo.get_by_external_id(uuid4())

    assert result is None


# -----------------------------------
# update()
# -----------------------------------
@pytest.mark.asyncio
async def test_update_baremo_ok(db):
    """
    Verifica la actualización de un baremo existente.
    """
    repo = BaremoRepository(db)

    # ❌ No usar "nombre"
    baremo = Baremo(estado=True)
    

