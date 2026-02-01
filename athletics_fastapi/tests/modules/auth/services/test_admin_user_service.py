import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from sqlalchemy import select

from app.modules.auth.services.admin_user_service import AdminUserService
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest


@pytest.fixture
def mock_users_repo():
    """Mock para AuthUsersRepository"""
    return AsyncMock()


@pytest.fixture
def admin_user_service(mock_users_repo):
    """Instancia del servicio con repo mockeado"""
    return AdminUserService(mock_users_repo)


class TestAdminUserServiceUpdateRole:
    """Tests para update_user_role"""

    @pytest.mark.asyncio
    async def test_update_user_role_user_not_found(self, admin_user_service, mock_users_repo):
        """TC-AU-01: Usuario no encontrado"""
        mock_users_repo.get_by_any_id.return_value = None
        
        result = await admin_user_service.update_user_role("user123", RoleEnum.ATLETA)
        
        assert result["success"] == False
        assert result["message"] == "Usuario no encontrado"
        assert result["status_code"] == 404

    @pytest.mark.asyncio
    async def test_update_user_role_to_atleta_new_profile(self, admin_user_service, mock_users_repo):
        """TC-AU-02: Cambiar a ATLETA, crear perfil nuevo"""
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.role = RoleEnum.ATLETA
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        # Mock the select query for atleta
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        result = await admin_user_service.update_user_role("user123", RoleEnum.ATLETA)
        
        assert result["success"] == True
        assert result["user"] == mock_user
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)

    @pytest.mark.asyncio
    async def test_update_user_role_to_entrenador_new_profile(self, admin_user_service, mock_users_repo):
        """TC-AU-03: Cambiar a ENTRENADOR, crear perfil nuevo"""
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.role = RoleEnum.ENTRENADOR
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        # Mock the select query for entrenador
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        result = await admin_user_service.update_user_role("user123", RoleEnum.ENTRENADOR)
        
        assert result["success"] == True
        assert result["user"] == mock_user
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)

    @pytest.mark.asyncio
    async def test_update_user_role_to_representante_new_profile(self, admin_user_service, mock_users_repo):
        """TC-AU-04: Cambiar a REPRESENTANTE, crear perfil nuevo"""
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.role = RoleEnum.REPRESENTANTE
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        # Mock the select query for representante
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        result = await admin_user_service.update_user_role("user123", RoleEnum.REPRESENTANTE)
        
        assert result["success"] == True
        assert result["user"] == mock_user
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)

    @pytest.mark.asyncio
    async def test_update_user_role_existing_profile(self, admin_user_service, mock_users_repo):
        """TC-AU-05: Cambiar rol cuando perfil ya existe"""
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.role = RoleEnum.ATLETA
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        # Mock the select query for atleta - already exists
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = MagicMock()  # Exists
        mock_db.execute = AsyncMock(return_value=mock_result)
        
        result = await admin_user_service.update_user_role("user123", RoleEnum.ATLETA)
        
        assert result["success"] == True
        assert result["user"] == mock_user
        mock_db.add.assert_not_called()  # Should not add since exists
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)


class TestAdminUserServiceGetAllUsers:
    """Tests para get_all_users"""

    @pytest.mark.asyncio
    async def test_get_all_users_basic(self, admin_user_service, mock_users_repo):
        """TC-AU-06: Obtener todos los usuarios básicos"""
        mock_users_repo.get_paginated.return_value = ([], 0)
        
        result = await admin_user_service.get_all_users()
        
        assert result["items"] == []
        assert result["total"] == 0
        assert result["page"] == 1
        assert result["size"] == 20
        assert result["pages"] == 0
        mock_users_repo.get_paginated.assert_called_once_with(page=1, size=20, role=None)

    @pytest.mark.asyncio
    async def test_get_all_users_with_params(self, admin_user_service, mock_users_repo):
        """TC-AU-07: Obtener usuarios con parámetros"""
        mock_users_repo.get_paginated.return_value = ([MagicMock()], 1)
        
        result = await admin_user_service.get_all_users(page=2, size=10, role=RoleEnum.ATLETA)
        
        assert len(result["items"]) == 1
        assert result["total"] == 1
        assert result["page"] == 2
        assert result["size"] == 10
        assert result["pages"] == 1
        mock_users_repo.get_paginated.assert_called_once_with(page=2, size=10, role=RoleEnum.ATLETA)


class TestAdminUserServiceUpdateUser:
    """Tests para update_user_by_id"""

    @pytest.mark.asyncio
    async def test_update_user_by_id_success(self, admin_user_service, mock_users_repo):
        """TC-AU-08: Actualizar usuario exitoso"""
        mock_user = MagicMock()
        mock_user.auth = MagicMock()
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        data = AdminUserUpdateRequest(
            username="newusername",
            email="new@email.com",
            is_active=True,
            profile_image="newimage.jpg"
        )
        
        result = await admin_user_service.update_user_by_id("user123", data)
        
        assert result == mock_user
        assert mock_user.username == "newusername"
        assert mock_user.auth.email == "new@email.com"
        assert mock_user.auth.is_active == True
        assert mock_user.profile_image == "newimage.jpg"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)

    @pytest.mark.asyncio
    async def test_update_user_by_id_partial_update(self, admin_user_service, mock_users_repo):
        """TC-AU-09: Actualizar usuario parcialmente"""
        mock_user = MagicMock()
        mock_user.auth = MagicMock()
        mock_users_repo.get_by_any_id.return_value = mock_user
        
        mock_db = AsyncMock()  # AsyncMock needed for DB session
        mock_users_repo.db = mock_db
        
        data = AdminUserUpdateRequest(username="newusername")  # Only username
        
        result = await admin_user_service.update_user_by_id("user123", data)
        
        assert result == mock_user
        assert mock_user.username == "newusername"
        # Others should not be set
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_user)

    @pytest.mark.asyncio
    async def test_update_user_by_id_not_found(self, admin_user_service, mock_users_repo):
        """TC-AU-10: Usuario no encontrado"""
        mock_users_repo.get_by_any_id.return_value = None
        
        data = AdminUserUpdateRequest(username="newusername")
        
        with pytest.raises(HTTPException) as exc_info:
            await admin_user_service.update_user_by_id("user123", data)
        
        assert exc_info.value.status_code == 404
        assert "Usuario no encontrado" in exc_info.value.detail