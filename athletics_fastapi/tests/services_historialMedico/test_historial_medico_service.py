import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

from fastapi import HTTPException

from app.modules.atleta.services.historial_medico_service import (
    HistorialMedicoService
)
from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
)
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum


# -------------------------------
# Fixture AsyncSession mockeada
# -------------------------------
@pytest.fixture
def db():
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session


# -------------------------------
# create()
# -------------------------------
@pytest.mark.asyncio
async def test_create_historial_ok(db):
    service = HistorialMedicoService(db)

    user = AuthUserModel(id=1, role=RoleEnum.ATLETA)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=lambda: user),
        MagicMock(scalar_one_or_none=lambda: None),
    ]

    data = HistorialMedicoCreate(
        talla=1.75,
        peso=70,
        imc=22.8,
        alergias="Polen",
        enfermedades_hereditarias=None,
        enfermedades=None
    )

    historial = await service.create(data, user_id=1)

    assert historial.auth_user_id == 1
    assert historial.peso == 70
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_create_historial_user_not_atleta(db):
    service = HistorialMedicoService(db)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: None
    )

    data = HistorialMedicoCreate(
        talla=1.70,
        peso=65,
        imc=22,
        alergias=None,
        enfermedades_hereditarias=None,
        enfermedades=None
    )

    with pytest.raises(HTTPException) as exc:
        await service.create(data, user_id=99)

    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_create_historial_already_exists(db):
    service = HistorialMedicoService(db)

    user = AuthUserModel(id=1, role=RoleEnum.ATLETA)
    historial = HistorialMedico(auth_user_id=1)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=lambda: user),
        MagicMock(scalar_one_or_none=lambda: historial),
    ]

    data = HistorialMedicoCreate(
        talla=1.70,
        peso=65,
        imc=22,
        alergias=None,
        enfermedades_hereditarias=None,
        enfermedades=None
    )

    with pytest.raises(HTTPException):
        await service.create(data, user_id=1)


# -------------------------------
# get()
# -------------------------------
@pytest.mark.asyncio
async def test_get_historial_ok(db):
    service = HistorialMedicoService(db)

    historial = HistorialMedico(external_id=uuid4())

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: historial
    )

    result = await service.get(historial.external_id)

    assert result == historial


@pytest.mark.asyncio
async def test_get_historial_not_found(db):
    service = HistorialMedicoService(db)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: None
    )

    with pytest.raises(HTTPException) as exc:
        await service.get(uuid4())

    assert exc.value.status_code == 404


# -------------------------------
# get_by_user()
# -------------------------------
@pytest.mark.asyncio
async def test_get_by_user_ok(db):
    service = HistorialMedicoService(db)

    historial = HistorialMedico(auth_user_id=1)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: historial
    )

    result = await service.get_by_user(1)

    assert result.auth_user_id == 1


@pytest.mark.asyncio
async def test_get_by_user_not_found(db):
    service = HistorialMedicoService(db)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: None
    )

    with pytest.raises(HTTPException):
        await service.get_by_user(1)


# -------------------------------
# get_all()
# -------------------------------
@pytest.mark.asyncio
async def test_get_all_historiales(db):
    service = HistorialMedicoService(db)

    historiales = [HistorialMedico(), HistorialMedico()]

    db.execute.return_value = MagicMock(
        scalars=lambda: MagicMock(all=lambda: historiales)
    )

    result = await service.get_all()

    assert len(result) == 2


# -------------------------------
# update()
# -------------------------------
@pytest.mark.asyncio
async def test_update_historial_ok(db):
    service = HistorialMedicoService(db)

    historial = HistorialMedico(
        external_id=uuid4(),
        peso=70
    )

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: historial
    )

    data = HistorialMedicoUpdate(peso=75)

    result = await service.update(historial.external_id, data)

    assert result.peso == 75
    db.commit.assert_called_once()
    db.refresh.assert_called_once()
