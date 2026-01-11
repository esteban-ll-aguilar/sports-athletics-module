"""
Módulo de Pruebas para el Servicio de Administración de Usuarios.
Verifica la lógica de negocio para gestionar roles y datos de usuarios desde la administración.
"""
import pytest
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

from fastapi import HTTPException

from app.modules.auth.services.admin_user_service import AdminUserService

from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest


# ---------------------------------
# Fixture del repositorio mockeado
# ---------------------------------
@pytest.fixture
def users_repo():
    """
    Mock del repositorio de usuarios.
    """
    repo = MagicMock()
    repo.get_by_external_id = AsyncMock()
    repo.get_all = AsyncMock()
    repo.count = AsyncMock()
    repo.session = MagicMock()
    repo.session.commit = AsyncMock()
    repo.session.refresh = AsyncMock()
    return repo


# ---------------------------------
# update_user_role()
# ---------------------------------
@pytest.mark.asyncio
async def test_update_user_role_ok(users_repo):
    """
    Verifica que se pueda actualizar el rol de un usuario correctamente.
    """
    service = AdminUserService(users_repo)

    user = MagicMock()
    user.external_id = str(uuid4())
    user.role = RoleEnum.ATLETA

    users_repo.get_by_external_id.return_value = user

    result = await service.update_user_role(
        user_id=user.external_id,
        new_role=RoleEnum.ENTRENADOR  # rol válido
    )

    assert result.role == RoleEnum.ENTRENADOR
    users_repo.session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_user_role_user_not_found(users_repo):
    """
    Verifica que se lance una excepción 404 si el usuario no existe.
    """
    service = AdminUserService(users_repo)

    users_repo.get_by_external_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        await service.update_user_role(
            user_id=str(uuid4()),
            new_role=RoleEnum.ENTRENADOR
        )

    assert exc.value.status_code == 404
    assert exc.value.detail == "Usuario no encontrado"


# ---------------------------------
# get_all_users()
# ---------------------------------
@pytest.mark.asyncio
async def test_get_all_users_ok(users_repo):
    """
    Verifica que se recuperen todos los usuarios de forma paginada.
    """
    service = AdminUserService(users_repo)

    users = [MagicMock(), MagicMock()]
    users_repo.get_all.return_value = users
    users_repo.count.return_value = 2

    result = await service.get_all_users(page=1, size=10)

    assert result["items"] == users
    assert result["total"] == 2
    assert result["page"] == 1
    assert result["size"] == 10
    assert result["pages"] == 1


# ---------------------------------
# update_user_by_id()
# ---------------------------------
@pytest.mark.asyncio
async def test_update_user_by_id_ok(users_repo):
    """
    Verifica la actualización de datos básicos de un usuario por su ID.
    """
    service = AdminUserService(users_repo)

    user = MagicMock()
    user.external_id = str(uuid4())
    user.username = "old_user"
    user.email = "old@email.com"
    user.is_active = True
    user.profile_image = None

    users_repo.get_by_external_id.return_value = user

    data = AdminUserUpdateRequest(
        username="new_user",
        email="new@email.com",
        is_active=False,
        profile_image="image.png"
    )

    result = await service.update_user_by_id(user.external_id, data)

    assert result.username == "new_user"
    assert result.email == "new@email.com"
    assert result.is_active is False
    assert result.profile_image == "image.png"

    users_repo.session.commit.assert_called_once()
    users_repo.session.refresh.assert_called_once_with(user)


@pytest.mark.asyncio
async def test_update_user_by_id_not_found(users_repo):
    """
    Verifica que falle al intentar actualizar un usuario inexistente.
    """
    service = AdminUserService(users_repo)

    users_repo.get_by_external_id.return_value = None

    data = AdminUserUpdateRequest(username="test")

    with pytest.raises(HTTPException) as exc:
        await service.update_user_by_id(str(uuid4()), data)

    assert exc.value.status_code == 404
    assert exc.value.detail == "Usuario no encontrado"
