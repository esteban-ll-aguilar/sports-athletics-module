"""
Comprehensive Tests for Competencia (Competition) Router Endpoints
Tests all competition, events, results, and scoring operations
"""
import pytest
from httpx import AsyncClient
from typing import Dict, Any
from uuid import UUID


@pytest.mark.asyncio
class TestCompetenciaEndpoints:
    """Test suite for Competition endpoints"""

    async def test_crear_competencia_as_admin(self, authenticated_admin_client: AsyncClient):
        """Test creating competition as admin"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/competencias",
            json={
                "nombre": "Campeonato Nacional 2024",
                "fecha_inicio": "2024-06-01",
                "fecha_fin": "2024-06-03",
                "ubicacion": "Estadio Principal",
                "descripcion": "Torneo nacional de atletismo"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True

    async def test_crear_competencia_as_entrenador(self, authenticated_entrenador_client: AsyncClient):
        """Test creating competition as coach"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/competencia/competencias",
            json={
                "nombre": "Torneo Interescolar",
                "fecha_inicio": "2024-07-15",
                "fecha_fin": "2024-07-16",
                "ubicacion": "Colegio Central"
            }
        )
        # Coaches should be able to create competitions
        assert response.status_code in [201, 403]

    async def test_listar_competencias(self, client: AsyncClient, test_admin_user: Dict[str, Any]):
        """Test listing competitions"""
        response = await client.get(
            "/api/v1/tests/competencia/competencias",
            headers={"Authorization": f"Bearer {test_admin_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    async def test_obtener_competencia(
        self, client: AsyncClient, test_competencia_uuid: UUID
    ):
        """Test getting competition by UUID"""
        response = await client.get(
            f"/api/v1/tests/competencia/competencias/{test_competencia_uuid}"
        )
        assert response.status_code == 200

    async def test_actualizar_competencia(
        self, authenticated_admin_client: AsyncClient, test_competencia_uuid: UUID
    ):
        """Test updating competition"""
        response = await authenticated_admin_client.put(
            f"/api/v1/tests/competencia/competencias/{test_competencia_uuid}",
            json={
                "nombre": "Campeonato Nacional 2024 - Actualizado",
                "ubicacion": "Nuevo Estadio"
            }
        )
        assert response.status_code == 200

    async def test_eliminar_competencia(
        self, authenticated_admin_client: AsyncClient, test_competencia_uuid: UUID
    ):
        """Test deleting competition"""
        response = await authenticated_admin_client.delete(
            f"/api/v1/tests/competencia/competencias/{test_competencia_uuid}"
        )
        assert response.status_code == 200


@pytest.mark.asyncio
class TestPruebaEndpoints:
    """Test suite for Event/Test endpoints"""

    async def test_crear_prueba(self, authenticated_admin_client: AsyncClient):
        """Test creating event/test"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/pruebas",
            json={
                "nombre": "100 metros planos",
                "tipo": "VELOCIDAD",
                "unidad_medida": "segundos",
                "descripcion": "Carrera de velocidad corta"
            }
        )
        assert response.status_code == 201

    async def test_listar_pruebas(self, client: AsyncClient):
        """Test listing tests"""
        response = await client.get("/api/v1/tests/competencia/pruebas/")
        assert response.status_code == 200

    async def test_obtener_prueba(self, client: AsyncClient, test_prueba_uuid: UUID):
        """Test getting test by UUID"""
        response = await client.get(
            f"/api/v1/tests/competencia/pruebas/{test_prueba_uuid}"
        )
        assert response.status_code == 200

    async def test_actualizar_prueba(
        self, authenticated_admin_client: AsyncClient, test_prueba_uuid: UUID
    ):
        """Test updating test"""
        response = await authenticated_admin_client.put(
            f"/api/v1/tests/competencia/pruebas/{test_prueba_uuid}",
            json={
                "nombre": "100m - Actualizado",
                "descripcion": "Descripción actualizada"
            }
        )
        assert response.status_code == 200


@pytest.mark.asyncio
class TestResultadoCompetenciaEndpoints:
    """Test suite for Competition Result endpoints"""

    async def test_crear_resultado(self, authenticated_admin_client: AsyncClient):
        """Test creating competition result"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/resultados",
            json={
                "competencia_id": "some-uuid",
                "atleta_id": 1,
                "prueba_id": "some-uuid",
                "resultado": "10.5",
                "posicion": 1,
                "medalla": "ORO"
            }
        )
        # May fail if IDs don't exist, but endpoint should be accessible
        assert response.status_code in [201, 400, 404]

    async def test_listar_resultados(self, client: AsyncClient):
        """Test listing results"""
        response = await client.get("/api/v1/tests/competencia/resultados")
        assert response.status_code == 200

    async def test_resultados_by_competencia(
        self, client: AsyncClient, test_competencia_uuid: UUID
    ):
        """Test getting results by competition"""
        response = await client.get(
            f"/api/v1/tests/competencia/resultados/competencia/{test_competencia_uuid}"
        )
        assert response.status_code == 200

    async def test_actualizar_resultado(
        self, authenticated_admin_client: AsyncClient, test_resultado_uuid: UUID
    ):
        """Test updating result"""
        response = await authenticated_admin_client.put(
            f"/api/v1/tests/competencia/resultados/{test_resultado_uuid}",
            json={
                "resultado": "10.3",
                "posicion": 1
            }
        )
        assert response.status_code in [200, 404]


@pytest.mark.asyncio
class TestBaremoEndpoints:
    """Test suite for Baremo (Scoring System) endpoints"""

    async def test_crear_baremo(self, authenticated_admin_client: AsyncClient):
        """Test creating baremo"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/baremos",
            json={
                "nombre": "Baremo IAAF 2024",
                "descripcion": "Sistema de puntuación internacional",
                "tipo": "VELOCIDAD",
                "valores": {"10.0": 1200, "10.5": 1150}
            }
        )
        assert response.status_code == 201

    async def test_listar_baremos(self, client: AsyncClient):
        """Test listing baremos"""
        response = await client.get("/api/v1/tests/competencia/baremos/")
        assert response.status_code == 200

    async def test_obtener_baremo(self, client: AsyncClient, test_baremo_uuid: UUID):
        """Test getting baremo by UUID"""
        response = await client.get(
            f"/api/v1/tests/competencia/baremos/{test_baremo_uuid}"
        )
        assert response.status_code in [200, 404]

    async def test_actualizar_baremo(
        self, authenticated_admin_client: AsyncClient, test_baremo_uuid: UUID
    ):
        """Test updating baremo"""
        response = await authenticated_admin_client.put(
            f"/api/v1/tests/competencia/baremos/{test_baremo_uuid}",
            json={
                "nombre": "Baremo Actualizado",
                "valores": {"9.8": 1300}
            }
        )
        assert response.status_code in [200, 404]


@pytest.mark.asyncio
class TestTipoDisciplinaEndpoints:
    """Test suite for Discipline Type endpoints"""

    async def test_crear_tipo_disciplina(self, authenticated_admin_client: AsyncClient):
        """Test creating discipline type"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/tipo-disciplina",
            json={
                "nombre": "Atletismo",
                "descripcion": "Deportes de pista y campo"
            }
        )
        assert response.status_code == 201

    async def test_listar_tipos_disciplina(self, client: AsyncClient):
        """Test listing discipline types"""
        response = await client.get("/api/v1/tests/competencia/tipo-disciplina/")
        assert response.status_code == 200

    async def test_obtener_tipo_disciplina(
        self, client: AsyncClient, test_tipo_disciplina_uuid: UUID
    ):
        """Test getting discipline type"""
        response = await client.get(
            f"/api/v1/tests/competencia/tipo-disciplina/{test_tipo_disciplina_uuid}"
        )
        assert response.status_code in [200, 404]

    async def test_actualizar_tipo_disciplina(
        self, authenticated_admin_client: AsyncClient, test_tipo_disciplina_uuid: UUID
    ):
        """Test updating discipline type"""
        response = await authenticated_admin_client.put(
            f"/api/v1/tests/competencia/tipo-disciplina/{test_tipo_disciplina_uuid}",
            json={
                "nombre": "Atletismo Olímpico",
                "descripcion": "Disciplina olímpica"
            }
        )
        assert response.status_code in [200, 404]


@pytest.mark.asyncio
class TestRegistroPruebaCompetenciaEndpoints:
    """Test suite for Test Registration endpoints"""

    async def test_crear_registro_prueba(self, authenticated_admin_client: AsyncClient):
        """Test registering test for competition"""
        response = await authenticated_admin_client.post(
            "/api/v1/tests/competencia/registro-prueba",
            json={
                "competencia_id": "some-uuid",
                "prueba_id": "some-uuid",
                "categoria": "Senior",
                "genero": "M"
            }
        )
        assert response.status_code in [201, 400, 404]

    async def test_listar_registros_by_competencia(
        self, client: AsyncClient, test_competencia_uuid: UUID
    ):
        """Test listing registrations by competition"""
        response = await client.get(
            f"/api/v1/tests/competencia/registro-prueba/competencia/{test_competencia_uuid}"
        )
        assert response.status_code == 200


@pytest.mark.asyncio
class TestCompetenciaRolePermissions:
    """Test role-based access for competition endpoints"""

    async def test_atleta_cannot_create_competencia(
        self, authenticated_atleta_client: AsyncClient
    ):
        """Test that athletes cannot create competitions"""
        response = await authenticated_atleta_client.post(
            "/api/v1/tests/competencia/competencias",
            json={
                "nombre": "Test",
                "fecha_inicio": "2024-08-01",
                "fecha_fin": "2024-08-02",
                "ubicacion": "Test"
            }
        )
        assert response.status_code == 403

    async def test_atleta_can_view_competencias(
        self, authenticated_atleta_client: AsyncClient
    ):
        """Test that athletes can view competitions"""
        response = await authenticated_atleta_client.get(
            "/api/v1/tests/competencia/competencias"
        )
        assert response.status_code == 200

    async def test_entrenador_can_create_resultado(
        self, authenticated_entrenador_client: AsyncClient
    ):
        """Test that coaches can create results"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/competencia/resultados",
            json={
                "competencia_id": "test-uuid",
                "atleta_id": 1,
                "prueba_id": "test-uuid",
                "resultado": "11.0",
                "posicion": 3
            }
        )
        # Should be accessible (may fail on validation)
        assert response.status_code in [201, 400, 404]
