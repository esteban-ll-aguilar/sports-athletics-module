"""
Módulo de Pruebas para Endpoints Administrativos.
Verifica las funcionalidades exclusivas de administradores, asegurando
que los servicios subyacentes son llamados correctamente.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from app.modules.admin.dependencies import get_admin_user_service
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.admin.services.admin_user_service import AdminUserService
from app.modules.auth.domain.models import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum

@pytest.fixture
def mock_admin_service():
    """
    Fixture que crea un mock del servicio de administración de usuarios.
    Preconfigura la respuesta de 'get_all_users'.
    """
    service = AsyncMock(spec=AdminUserService)
    # Mock para get_all_users
    service.get_all_users.return_value = {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 20,
        "pages": 0
    }
    return service

# Override dependencias
async def override_get_current_admin_user():
    """
    Override para simular un usuario administrador autenticado.
    """
    user = MagicMock(spec=AuthUserModel)
    user.id = "admin_id"
    user.email = "admin@example.com"
    user.role.name = RoleEnum.ADMINISTRADOR
    return user

@pytest.mark.asyncio
async def test_admin_list_users(client: AsyncClient, mock_admin_service):
    """
    Prueba el listado de usuarios (/api/v1/admin/users/).
    Verifica que un administrador pueda obtener la lista paginada de usuarios.
    """
    # Override de dependencias especifico para este test
    from app.main import _APP
    
    _APP.dependency_overrides[get_admin_user_service] = lambda: mock_admin_service
    _APP.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
    
    response = await client.get("/api/v1/admin/users/")
    
    # Limpieza
    _APP.dependency_overrides = {}
    
    # 200 OK
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["items"] == []

@pytest.mark.asyncio
async def test_admin_update_role(client: AsyncClient, mock_admin_service):
    """
    Prueba la actualización de roles (/api/v1/admin/users/{id}/role).
    Verifica que un administrador pueda cambiar el rol de un usuario.
    """
    from app.main import _APP
    
    mock_user_updated = MagicMock()
    mock_user_updated.id = "user_123"
    mock_user_updated.email = "test@test.com"
    mock_user_updated.username = "testuser" # Posible campo faltante
    mock_user_updated.role.name = "ENTRENADOR"
    mock_user_updated.is_active = True
    from datetime import datetime
    from uuid import uuid4
    mock_user_updated.created_at = datetime.now()
    mock_user_updated.updated_at = datetime.now()
    mock_user_updated.role = RoleEnum.ENTRENADOR
    mock_user_updated.external_id = uuid4()
    mock_user_updated.profile_image = None
    # Asegurar que el response model pueda leer el enum correctamente o su valor
    # En esquemas de auth/admin suele ser role: RoleEnum
    
    mock_admin_service.update_user_role.return_value = mock_user_updated
    
    _APP.dependency_overrides[get_admin_user_service] = lambda: mock_admin_service
    _APP.dependency_overrides[get_current_admin_user] = override_get_current_admin_user

    response = await client.put("/api/v1/admin/users/user_123/role", json={"role": "ENTRENADOR"})
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    assert response.json()["role"] == "ENTRENADOR"
