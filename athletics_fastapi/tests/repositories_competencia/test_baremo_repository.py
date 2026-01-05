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
    repo = BaremoRepository(db)

    # ❌ No usar campos inexistentes como "nombre"
    baremo = Baremo()

    result = await repo.create(baremo)

    db.add.assert_called_once_with(baremo)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(baremo)
    assert result == baremo


# -----------------------------------
# get_all() - incluye inactivos
# -----------------------------------
@pytest.mark.asyncio
async def test_get_all_baremos_incluye_inactivos(db):
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
    repo = BaremoRepository(db)

    # ❌ No usar "nombre"
    baremo = Baremo(estado=True)

    result = await repo.update(baremo)

    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(baremo)
    assert result == baremo
