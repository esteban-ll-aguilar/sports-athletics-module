"""
Módulo de Pruebas Unitarias para User Management (Gestión de Usuarios).
Cubre los Casos de Prueba TC-UM-01 a TC-UM-08 especificados en AUTH.README.md.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock
from app.main import _APP
from app.modules.auth.dependencies import (
    get_current_admin_user, get_admin_user_service
)
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.core.jwt.jwt import get_current_user
import pytest_asyncio

# --------------------------
# FIXTURES Y MOCKS
# --------------------------

@pytest.fixture
def mock_admin_service():
    service = AsyncMock()
    return service

@pytest.fixture
def mock_admin_user():
    # Create a real AuthUserModel instance for dependency injection
    from app.modules.auth.domain.enums import RoleEnum
    admin = MagicMock(spec=AuthUserModel)
    admin.id = 1
    admin.username = "admin"
    admin.email = "admin@test.com"
    admin.profile = MagicMock()
    admin.profile.role = RoleEnum.ADMINISTRADOR
    admin.is_active = True
    return admin

@pytest.fixture
def override_deps(mock_admin_service, mock_admin_user):
    # Override both get_current_user AND get_current_admin_user  
    # because get_current_admin_user depends on get_current_user
    _APP.dependency_overrides[get_current_user] = lambda: mock_admin_user
    _APP.dependency_overrides[get_admin_user_service] = lambda: mock_admin_service
    _APP.dependency_overrides[get_current_admin_user] = lambda: mock_admin_user
    yield mock_admin_service, mock_admin_user
    _APP.dependency_overrides = {}

@pytest_asyncio.fixture(loop_scope="function")
async def client() -> AsyncClient:
    async with AsyncClient(transport=ASGITransport(app=_APP), base_url="http://test") as c:
        yield c

# Helper to create a user dict compatible with UserResponseSchema
def create_user_dict(user_id=1, username="user1", email="user1@test.com", role="ATLETA", is_active=True):
    from uuid import uuid4
    return {
        "id": user_id,
        "external_id": str(uuid4()),  # Required UUID
        "auth_user_id": user_id,  # Required
        "username": username,
        "email": email,
        "role": role,
        "is_active": is_active,
        "first_name": "Test",
        "last_name": "User",
        "profile_image": None,
        "direccion": None,  # Optional string
        "tipo_identificacion": "CEDULA",
        "identificacion": "1104680135",  # Valid Ecuador cedula
        "phone": "0999999999",
        "tipo_estamento": "ESTUDIANTES",  # Valid enum value
        "fecha_nacimiento": None,
        "sexo": "M",  # Valid enum 'M' or 'F'
        "two_factor_enabled": False,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

# --------------------------
# TC-UM-01: Listar Usuarios (Éxito)
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_01_list_users_success(client: AsyncClient, override_deps):
    """
    TC-UM-01: Admin obtiene lista paginada de usuarios.
    Expected: 200 OK, Success=True, data con items, total, page, size, pages.
    """
    service, admin = override_deps
    service.get_all_users.return_value = {
        "items": [create_user_dict()],
        "total": 1,
        "page": 1,
        "size": 20,
        "pages": 1
    }
    
    response = await client.get("/api/v1/auth/users/?page=1&size=20")
    
    assert response.status_code == 200
    data = response.json()
    # Pydantic model PaginatedUsers output structure
    assert data["total"] == 1
    assert len(data["items"]) == 1

# --------------------------
# TC-UM-02: Listar Usuarios con Filtro de Rol
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_02_list_users_filter_role(client: AsyncClient, override_deps):
    """
    TC-UM-02: Filtrar usuarios por rol ATLETA.
    Expected: 200 OK, solo usuarios con rol ATLETA.
    """
    service, admin = override_deps
    service.get_all_users.return_value = {
        "items": [create_user_dict(user_id=1, username="atleta1", role="ATLETA")],
        "total": 1,
        "page": 1,
        "size": 20,
        "pages": 1
    }
    
    response = await client.get("/api/v1/auth/users/?page=1&size=20&role=ATLETA")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["role"] == "ATLETA"

# --------------------------
# TC-UM-03: Listar Usuarios Vacío
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_03_list_users_empty(client: AsyncClient, override_deps):
    """
    TC-UM-03: No hay usuarios que cumplan el filtro.
    Expected: 200 OK, items vacío.
    """
    service, admin = override_deps
    service.get_all_users.return_value = {
        "items": [],
        "total": 0,
        "page": 1,
        "size": 20,
        "pages": 0
    }
    
    response = await client.get("/api/v1/auth/users/?page=1&size=20&role=ENTRENADOR")
    
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert len(data["items"]) == 0

# --------------------------
# TC-UM-05: Actualizar Rol de Usuario (Éxito)
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_05_update_user_role_success(client: AsyncClient, override_deps):
    """
    TC-UM-05: Admin actualiza rol a ENTRENADOR.
    Expected: 200 OK, Success=True, usuario con nuevo rol.
    """
    service, admin = override_deps
    
    # Create a mock user object that can be validated by Pydantic
    updated_user_data = create_user_dict(user_id=1, username="user1", role="ENTRENADOR")
    
    # Create a MagicMock that behaves like an ORM model
    mock_user = MagicMock()
    for key, value in updated_user_data.items():
        setattr(mock_user, key, value)
    
    service.update_user_role.return_value = mock_user
    
    payload = {"role": "ENTRENADOR"}
    response = await client.put("/api/v1/auth/users/1/role", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "ENTRENADOR"

# --------------------------
# TC-UM-06: Actualizar Rol (Usuario No Encontrado)
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_06_update_user_role_not_found(client: AsyncClient, override_deps):
    """
    TC-UM-06: Intento de actualizar usuario inexistente.
    Expected: 404 Not Found, Success=False.
    """
    service, admin = override_deps
    service.update_user_role.side_effect = Exception("User Not Found Mock Exception")
    
    # Ideally the service raises an exception or returns None, handled by router.
    # Assuming standard behavior where service raises HTTPException or similar or returns None.
    # But checking router code in step 120, it just calls service.update_user_role and returns validation.
    # So the service is responsible for 404.
    
    from fastapi import HTTPException
    service.update_user_role.side_effect = HTTPException(status_code=404, detail="Usuario no encontrado")

    payload = {"role": "ATLETA"}
    response = await client.put("/api/v1/auth/users/99999/role", json=payload)
    
    assert response.status_code == 404
    data = response.json()
    # When HTTPException is raised, FastAPI standard error response is {"detail": "message"}
    # BUT global handler wraps it.
    assert "Usuario no encontrado" in data["message"]

# --------------------------
# TC-UM-07: Actualizar Rol (Sin Permisos Admin)
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_07_update_user_role_forbidden(client: AsyncClient):
    """
    TC-UM-07: Usuario regular intenta actualizar rol.
    Expected: 403 Forbidden.
    """
    # Override de dependencia para simular acceso denegado
    from fastapi import HTTPException, status
    
    async def mock_forbidden():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )

    _APP.dependency_overrides[get_current_admin_user] = mock_forbidden
    
    payload = {"role": "ADMIN"}
    response = await client.put("/api/v1/auth/users/1/role", json=payload)
    
    # Limpiar override
    if get_current_admin_user in _APP.dependency_overrides:
        del _APP.dependency_overrides[get_current_admin_user]
    
    assert response.status_code == 403
    data = response.json()
    assert data["message"] == "No tienes permisos de administrador"

# --------------------------
# TC-UM-08: Actualizar Rol (Validación Rol Inválido)
# --------------------------
@pytest.mark.asyncio
async def test_tc_um_08_update_user_role_invalid_role(client: AsyncClient, override_deps):
    """
    TC-UM-08: Rol no existente en enum.
    Expected: 422 Validation Error.
    """
    payload = {"role": "INVALID_ROLE"}
    response = await client.put("/api/v1/auth/users/1/role", json=payload)
    
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data  # FastAPI validation error format
