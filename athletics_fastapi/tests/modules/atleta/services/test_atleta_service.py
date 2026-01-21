
#ruebas Unitarias para AtletaService.
#erifica la lógica de negocio para la gestión de atletas.

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from fastapi import HTTPException
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.domain.schemas.atleta_schema import AtletaCreate, AtletaUpdate
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum

@pytest.fixture
def mock_atleta_repo():
    return AsyncMock()

@pytest.fixture
def mock_auth_repo():
    return AsyncMock()

@pytest.fixture
def mock_resultado_repo():
    return AsyncMock()

@pytest.fixture
def service(mock_atleta_repo, mock_auth_repo, mock_resultado_repo):
    return AtletaService(mock_atleta_repo, mock_auth_repo, mock_resultado_repo)

@pytest.mark.asyncio
async def test_create_atleta_success(service, mock_auth_repo, mock_atleta_repo):
    """Verifica creación de atleta exitosa."""
    user = MagicMock(id=1, email="test@test.com")
    user.user_profile = MagicMock(role=RoleEnum.ATLETA)
    mock_auth_repo.get_by_id.return_value = user
    mock_atleta_repo.get_by_user_id.return_value = None # No existe aun
    mock_atleta_repo.create.return_value = MagicMock(id=1, user_id=1)

    data = AtletaCreate(
        anios_experiencia=5,
        fecha_nacimiento=date(2000, 1, 1),
        foto_perfil=None
    )

    result = await service.create(data, user_id=1)

    assert result.user_id == 1
    mock_atleta_repo.create.assert_awaited_once()

@pytest.mark.asyncio
async def test_create_atleta_not_atleta_role(service, mock_auth_repo):
    """Falla si usuario no es ATLETA."""
    user = MagicMock(id=1)
    user.user_profile = MagicMock(role=RoleEnum.ADMINISTRADOR)
    mock_auth_repo.get_by_id.return_value = user

    data = AtletaCreate(
        anios_experiencia=5,
         fecha_nacimiento=date(2000, 1, 1)
    )

    with pytest.raises(HTTPException) as exc:
        await service.create(data, user_id=1)
    
    assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_create_atleta_already_exists(service, mock_auth_repo, mock_atleta_repo):
    """Falla si ya tiene perfil."""
    user = MagicMock(id=1)
    user.user_profile = MagicMock(role=RoleEnum.ATLETA)
    mock_auth_repo.get_by_id.return_value = user
    mock_atleta_repo.get_by_user_id.return_value = MagicMock() # Ya existe

    data = AtletaCreate(
        anios_experiencia=5,
        fecha_nacimiento=date(2000, 1, 1)
    )

    with pytest.raises(HTTPException) as exc:
        await service.create(data, user_id=1)
    
    assert exc.value.status_code == 400

@pytest.mark.asyncio
async def test_get_by_id_not_found(service, mock_atleta_repo):
    mock_atleta_repo.get_by_id.return_value = None
    
    with pytest.raises(HTTPException) as exc:
        await service.get_by_id(999)
    assert exc.value.status_code == 404

@pytest.mark.asyncio
async def test_update_atleta(service, mock_atleta_repo):
    atleta_mock = MagicMock()
    # Mockear atributo real para que la aserción funcione
    atleta_mock.anios_experiencia = 5
    mock_atleta_repo.get_by_id.return_value = atleta_mock
    mock_atleta_repo.update.return_value = atleta_mock

    data = AtletaUpdate(anios_experiencia=10)
    await service.update(1, data)

    assert atleta_mock.anios_experiencia == 10
    mock_atleta_repo.update.assert_awaited_once()
