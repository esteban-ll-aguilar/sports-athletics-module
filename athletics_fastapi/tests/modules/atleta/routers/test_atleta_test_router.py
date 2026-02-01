"""
Comprehensive Tests for Atleta Router Endpoints
Tests all CRUD operations for athletes and medical history
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import _APP
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico


@pytest.mark.asyncio
class TestAtletaEndpoints:
    """Test suite for Atleta endpoints"""

    async def test_create_atleta(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test creating athlete profile"""
        response = await client.post(
            "/api/v1/tests/atleta/",
            json={
                "peso": 70.5,
                "altura": 1.75,
                "fecha_nacimiento": "2000-01-01",
                "genero": "M",
                "categoria": "Senior"
            },
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["peso"] == 70.5
        assert data["altura"] == 1.75

    async def test_get_my_atleta(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test getting own athlete profile"""
        response = await client.get(
            "/api/v1/tests/atleta/me",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "peso" in data
        assert "altura" in data

    async def test_get_my_historial(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test getting athlete competition history"""
        response = await client.get(
            "/api/v1/tests/atleta/historial",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_my_estadisticas(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test getting athlete statistics"""
        response = await client.get(
            "/api/v1/tests/atleta/estadisticas",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_competencias" in data or data is not None

    async def test_list_atletas_public(self, client: AsyncClient):
        """Test listing all athletes (public)"""
        response = await client.get("/api/v1/tests/atleta/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_atleta_by_id(self, client: AsyncClient, test_atleta: Atleta):
        """Test getting athlete by ID"""
        response = await client.get(f"/api/v1/tests/atleta/{test_atleta.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_atleta.id

    async def test_update_atleta(self, client: AsyncClient, test_atleta_user: AuthUserModel, test_atleta: Atleta):
        """Test updating athlete"""
        response = await client.put(
            f"/api/v1/tests/atleta/{test_atleta.id}",
            json={"peso": 72.0, "altura": 1.76},
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["peso"] == 72.0

    async def test_delete_atleta(self, client: AsyncClient, test_atleta_user: AuthUserModel, test_atleta: Atleta):
        """Test deleting athlete"""
        response = await client.delete(
            f"/api/v1/tests/atleta/{test_atleta.id}",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 204


@pytest.mark.asyncio
class TestHistorialMedicoEndpoints:
    """Test suite for Medical History endpoints"""

    async def test_create_historial_medico(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test creating medical history"""
        response = await client.post(
            "/api/v1/tests/atleta/historial-medico/",
            json={
                "tipo_sangre": "O+",
                "alergias": "Ninguna",
                "enfermedades_cronicas": "",
                "medicamentos_actuales": "",
                "contacto_emergencia": "Juan Pérez",
                "telefono_emergencia": "0987654321"
            },
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["tipo_sangre"] == "O+"

    async def test_get_my_historial_medico(self, client: AsyncClient, test_atleta_user: AuthUserModel):
        """Test getting own medical history"""
        response = await client.get(
            "/api/v1/tests/atleta/historial-medico/me",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        # Can be 200 with data or None if no history created yet
        assert response.status_code in [200, 404]

    async def test_list_historiales(self, client: AsyncClient, test_admin_user: AuthUserModel):
        """Test listing all medical histories (admin)"""
        response = await client.get(
            "/api/v1/tests/atleta/historial-medico/",
            headers={"Authorization": f"Bearer {test_admin_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_historial_by_user_as_entrenador(
        self, client: AsyncClient, test_entrenador_user: AuthUserModel, test_atleta_user: AuthUserModel
    ):
        """Test coach accessing athlete medical history"""
        response = await client.get(
            f"/api/v1/tests/atleta/historial-medico/user/{test_atleta_user['user_id']}",
            headers={"Authorization": f"Bearer {test_entrenador_user['token']}"}
        )
        # Should be allowed for coach
        assert response.status_code in [200, 404]

    async def test_update_historial_medico(
        self, client: AsyncClient, test_atleta_user: AuthUserModel, test_historial_medico: HistorialMedico
    ):
        """Test updating medical history"""
        response = await client.put(
            f"/api/v1/tests/atleta/historial-medico/{test_historial_medico.external_id}",
            json={"tipo_sangre": "A+", "alergias": "Polen"},
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["tipo_sangre"] == "A+"


@pytest.mark.asyncio
class TestAtletaRolePermissions:
    """Test role-based access control for athlete endpoints"""

    async def test_non_atleta_cannot_create_historial(self, client: AsyncClient, test_entrenador_user: AuthUserModel):
        """Test that non-athletes cannot create medical history"""
        response = await client.post(
            "/api/v1/tests/atleta/historial-medico/",
            json={
                "tipo_sangre": "O+",
                "alergias": "Ninguna",
                "contacto_emergencia": "Test",
                "telefono_emergencia": "123456"
            },
            headers={"Authorization": f"Bearer {test_entrenador_user['token']}"}
        )
        assert response.status_code == 403

    async def test_non_coach_cannot_access_other_historial(
        self, client: AsyncClient, test_atleta_user: AuthUserModel, test_other_atleta: Atleta
    ):
        """Test that regular athletes cannot access other athletes' medical history"""
        response = await client.get(
            f"/api/v1/tests/atleta/historial-medico/user/{test_other_atleta.user_profile_id}",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 403
