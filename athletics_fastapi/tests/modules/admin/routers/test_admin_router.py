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
    user.profile = MagicMock()
    user.profile.role = RoleEnum.ADMINISTRADOR
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
    from app.core.jwt.jwt import get_current_user
    _APP.dependency_overrides[get_current_user] = override_get_current_admin_user
    
    response = await client.get("/api/v1/auth/users/")
    
    # Limpieza
    _APP.dependency_overrides = {}
    
    # 200 OK
    assert response.status_code == 200
    json_response = response.json()
    assert "items" in json_response
    assert json_response["items"] == []

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
    from app.modules.auth.domain.enums import SexoEnum

    # Create mock with proper values for Pydantic validation
    test_uuid = uuid4()
    test_date = date(2000, 1, 1)
    test_datetime = datetime.now()
    
    class MockUser:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        
        def get(self, key, default=None):
            return getattr(self, key, default)

        def __getitem__(self, key):
            return getattr(self, key)
    
    user_data = {
        'id': 1,
        'auth_user_id': 1,
        'external_id': test_uuid,
        'username': "testuser",
        'email': "test@test.com",
        'first_name': "Test",
        'last_name': "User",
        'phone': "0999999999",
        'profile_image': "",
        'direccion': "Direccion Mock",
        'tipo_identificacion': TipoIdentificacionEnum.CEDULA,
        'identificacion': "1101101101",
        'tipo_estamento': TipoEstamentoEnum.ESTUDIANTES,
        'fecha_nacimiento': test_date,
        'sexo': SexoEnum.M,
        'role': RoleEnum.ENTRENADOR,
        'is_active': True,
        'two_factor_enabled': False,
        'created_at': test_datetime,
        'updated_at': test_datetime
    }
    
    # Use simple object
    mock_user_updated = MockUser(**user_data)
    
    # Add auth mock
    mock_user_updated.auth = MockUser(email="test@test.com")
    
    # Configure service return value
    # The service returns a dict structure, not just the user model
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
    assert json_response["role"] == "ENTRENADOR"
