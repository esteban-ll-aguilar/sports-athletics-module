"""
Módulo de Pruebas para Endpoints Administrativos.
Verifica las funcionalidades exclusivas de administradores, asegurando
que los servicios subyacentes son llamados correctamente.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock
from app.modules.auth.dependencies import get_admin_user_service
from app.modules.auth.dependencies import get_current_admin_user
from app.modules.auth.services.admin_user_service import AdminUserService
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
    user = MagicMock()
    user.id = "admin_id"
    user.email = "admin@example.com"
    user.user_profile = MagicMock()
    user.user_profile.role = RoleEnum.ADMINISTRADOR
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
    
    response = await client.get("/api/v1/auth/users/")
    
    # Limpieza
    _APP.dependency_overrides = {}
    
    # 200 OK
    assert response.status_code == 200
    json_response = response.json()
    assert "data" in json_response
    data = json_response["data"]
    assert "items" in data
    assert data["items"] == []

@pytest.mark.asyncio
async def test_admin_update_role(client: AsyncClient, mock_admin_service):
    """
    Prueba la actualización de roles (/api/v1/auth/users/{id}/role).
    Verifica que un administrador pueda cambiar el rol de un usuario.
    """
    from app.main import _APP
    
    from datetime import datetime, date
    from uuid import uuid4
    from app.modules.auth.domain.enums.tipo_identificacion_enum import TipoIdentificacionEnum
    from app.modules.auth.domain.enums.tipo_estamento_enum import TipoEstamentoEnum

    mock_user_updated = MagicMock()
    mock_user_updated.id = 1
    mock_user_updated.email = "test@test.com"
    mock_user_updated.username = "testuser"
    mock_user_updated.role = RoleEnum.ENTRENADOR
    mock_user_updated.is_active = True
    
    # Campos adicionales requeridos por UserRead
    mock_user_updated.first_name = "Test"
    mock_user_updated.last_name = "User"
    mock_user_updated.tipo_identificacion = TipoIdentificacionEnum.CEDULA
    mock_user_updated.identificacion = "1101101101"
    mock_user_updated.tipo_estamento = TipoEstamentoEnum.ESTUDIANTES
    mock_user_updated.phone = "0999999999"
    mock_user_updated.direccion = "Direccion Mock"
    mock_user_updated.fecha_nacimiento = date(2000, 1, 1)
    mock_user_updated.sexo = "M" 

    mock_user_updated.created_at = datetime.now()
    mock_user_updated.updated_at = datetime.now()
    mock_user_updated.external_id = uuid4()
    mock_user_updated.profile_image = None
    # Asegurar que el response model pueda leer el enum correctamente o su valor
    # En esquemas de auth/admin suele ser role: RoleEnum
    
    mock_admin_service.update_user_role.return_value = {
        "success": True,
        "user": mock_user_updated
    }
    
    _APP.dependency_overrides[get_admin_user_service] = lambda: mock_admin_service
    _APP.dependency_overrides[get_current_admin_user] = override_get_current_admin_user

    response = await client.put("/api/v1/auth/users/user_123/role", json={"role": "ENTRENADOR"})
    
    _APP.dependency_overrides = {}
    
    assert response.status_code == 200
    json_response = response.json()
    assert "data" in json_response
    data = json_response["data"]
    assert data["role"] == "ENTRENADOR"
