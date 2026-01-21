"""
Módulo de Pruebas para el Servicio de Historial Médico.
Valida la lógica de negocio para crear, leer y actualizar el historial médico de los atletas.
"""
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
    TipoAlergia,
    TipoEnfermedadHereditaria,
    TipoEnfermedad
)
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum


# -------------------------------
# Fixture AsyncSession mockeada
# -------------------------------
@pytest.fixture
def db():
    """
    Mock de la sesión de base de datos asíncrona.
    """
    session = AsyncMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    return session


# -------------------------------
# create()
# -------------------------------
@pytest.mark.asyncio
async def test_create_historial_calculo_automatico_imc(db):
    """
    Verifica que al enviar solo peso y talla, el sistema calcule
    y guarde el IMC correcto.
    """
    service = HistorialMedicoService(db)

    user = MagicMock(id=1)
    user.user_profile = MagicMock(role=RoleEnum.ATLETA)
    
    atleta = MagicMock(id=1)

    # Mocks de base de datos
    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=lambda: user), # Encuentra usuario
        MagicMock(scalar_one_or_none=lambda: atleta), # Encuentra atleta
        MagicMock(scalar_one_or_none=lambda: None), # No encuentra historial previo
    ]

    # DATOS DE ENTRADA (Nota que NO enviamos imc)
    data = HistorialMedicoCreate(
        talla=2,
        peso=80,
        alergias=TipoAlergia.NINGUNA,
        enfermedades_hereditarias=TipoEnfermedadHereditaria.NINGUNA,
        enfermedades=TipoEnfermedad.NINGUNA,
    )

    # Ejecución
    historial_creado = await service.create(data, user_id=1)

    expected_imc = 80 / (2 ** 2)

    assert pytest.approx(historial_creado.imc, rel=1e-3) == expected_imc
    assert historial_creado.peso == 80
    assert historial_creado.talla == 2

    #historial creado correctamente
    print(f"IMC calculado: {historial_creado.imc}")
    print(f"IMC esperado: {expected_imc}")
    print(f"Talla: {historial_creado.talla}, Peso: {historial_creado.peso}")

    # Verificamos que se llamó a guardar
    db.add.assert_called_once()
    db.commit.assert_called_once()

@pytest.mark.asyncio
async def test_create_historial_user_not_atleta(db):
    """
    Verifica que falle si el usuario no tiene rol de Atleta.
    """
    service = HistorialMedicoService(db)

    user = MagicMock(id=99)
    user.user_profile = MagicMock(role=RoleEnum.ENTRENADOR)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: user
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
    """
    Verifica que no se duplique el historial para un mismo usuario.
    """
    service = HistorialMedicoService(db)

    user = MagicMock(id=1)
    user.user_profile = MagicMock(role=RoleEnum.ATLETA)
    
    atleta = MagicMock(id=1)
    historial = HistorialMedico(atleta_id=1)

    db.execute.side_effect = [
        MagicMock(scalar_one_or_none=lambda: user),
        MagicMock(scalar_one_or_none=lambda: atleta),
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
    """
    Verifica la obtención de historial por su ID externo.
    """
    service = HistorialMedicoService(db)

    historial = HistorialMedico(external_id=uuid4())

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: historial
    )

    result = await service.get(historial.external_id)

    assert result == historial


@pytest.mark.asyncio
async def test_get_historial_not_found(db):
    """
    Verifica el error 404 cuando el historial no existe.
    """
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
    """
    Verifica la obtención de historial usando el ID del usuario (atleta).
    """
    service = HistorialMedicoService(db)

    historial = HistorialMedico(atleta_id=1)

    db.execute.return_value = MagicMock(
        scalar_one_or_none=lambda: historial
    )

    result = await service.get_by_user(1)

    assert result.atleta_id == 1


@pytest.mark.asyncio
async def test_get_by_user_not_found(db):
    """
    Verifica el error si no se encuentra historial para el usuario.
    """
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
    """
    Verifica que se recuperen todos los historiales.
    """
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
    """
    Verifica la actualización de un historial existente.
    """
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
