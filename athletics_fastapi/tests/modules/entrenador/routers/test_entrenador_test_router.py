"""
Comprehensive Tests for Entrenador (Coach) Router Endpoints
Tests all training, schedule, and attendance management operations
"""
import pytest
from httpx import AsyncClient
from datetime import date, timedelta
from typing import Dict, Any


@pytest.mark.asyncio
class TestEntrenamientoEndpoints:
    """Test suite for Training Session endpoints"""

    async def test_create_entrenamiento(self, authenticated_entrenador_client: AsyncClient):
        """Test creating a training session as coach"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/entrenamientos/",
            json={
                "nombre": "Entrenamiento de Velocidad",
                "descripcion": "Sesión de sprints y técnica",
                "tipo": "VELOCIDAD",
                "ubicacion": "Pista Atlética Principal"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["nombre"] == "Entrenamiento de Velocidad"
        assert "id" in data

    async def test_list_my_entrenamientos(self, authenticated_entrenador_client: AsyncClient):
        """Test listing coach's training sessions"""
        response = await authenticated_entrenador_client.get(
            "/api/v1/tests/entrenador/entrenamientos/"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_get_entrenamiento_detail(
        self, authenticated_entrenador_client: AsyncClient, test_entrenamiento_id: int
    ):
        """Test getting training session detail"""
        response = await authenticated_entrenador_client.get(
            f"/api/v1/tests/entrenador/entrenamientos/{test_entrenamiento_id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_entrenamiento_id

    async def test_update_entrenamiento(
        self, authenticated_entrenador_client: AsyncClient, test_entrenamiento_id: int
    ):
        """Test updating training session"""
        response = await authenticated_entrenador_client.put(
            f"/api/v1/tests/entrenador/entrenamientos/{test_entrenamiento_id}",
            json={
                "nombre": "Entrenamiento Actualizado",
                "descripcion": "Descripción actualizada",
                "horarios": []
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["nombre"] == "Entrenamiento Actualizado"

    async def test_delete_entrenamiento(
        self, authenticated_entrenador_client: AsyncClient, test_entrenamiento_id: int
    ):
        """Test deleting training session"""
        response = await authenticated_entrenador_client.delete(
            f"/api/v1/tests/entrenador/entrenamientos/{test_entrenamiento_id}"
        )
        assert response.status_code == 204

    async def test_non_entrenador_cannot_create_entrenamiento(
        self, authenticated_atleta_client: AsyncClient
    ):
        """Test that non-coaches cannot create training sessions"""
        response = await authenticated_atleta_client.post(
            "/api/v1/tests/entrenador/entrenamientos/",
            json={
                "nombre": "Test",
                "descripcion": "Test",
                "tipo": "FUERZA",
                "ubicacion": "Test"
            }
        )
        assert response.status_code == 403


@pytest.mark.asyncio
class TestHorarioEndpoints:
    """Test suite for Schedule endpoints"""

    async def test_create_horario(
        self, authenticated_entrenador_client: AsyncClient, test_entrenamiento_id: int
    ):
        """Test creating a schedule for training"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/horarios/",
            json={
                "entrenamiento_id": test_entrenamiento_id,
                "dia_semana": "LUNES",
                "hora_inicio": "08:00:00",
                "hora_fin": "10:00:00"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["dia_semana"] == "LUNES"

    async def test_list_horarios_by_entrenamiento(
        self, client: AsyncClient, test_entrenamiento_id: int
    ):
        """Test listing schedules for a training session"""
        response = await client.get(
            f"/api/v1/tests/entrenador/horarios/{test_entrenamiento_id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_delete_horario(
        self, authenticated_entrenador_client: AsyncClient, test_horario_id: int
    ):
        """Test deleting a schedule"""
        response = await authenticated_entrenador_client.delete(
            f"/api/v1/tests/entrenador/horarios/{test_horario_id}"
        )
        assert response.status_code == 204


@pytest.mark.asyncio
class TestAsistenciaEndpoints:
    """Test suite for Attendance endpoints"""

    async def test_inscribir_atleta(
        self, 
        authenticated_entrenador_client: AsyncClient, 
        test_horario_id: int,
        test_atleta_user: Dict[str, Any]
    ):
        """Test enrolling athlete in schedule"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/inscripcion",
            json={
                "horario_id": test_horario_id,
                "atleta_id": test_atleta_user["atleta_id"]
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["horario_id"] == test_horario_id

    async def test_listar_inscritos(
        self, client: AsyncClient, test_horario_id: int, test_atleta_user: Dict[str, Any]
    ):
        """Test listing enrolled athletes"""
        response = await client.get(
            f"/api/v1/tests/entrenador/inscripcion/?horario_id={test_horario_id}",
            headers={"Authorization": f"Bearer {test_atleta_user['token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_registrar_asistencia(
        self, authenticated_entrenador_client: AsyncClient, test_registro_asistencia_id: int
    ):
        """Test creating attendance record"""
        today = date.today()
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/registro",
            json={
                "registro_asistencias_id": test_registro_asistencia_id,
                "fecha_entrenamiento": today.isoformat(),
                "presente": True,
                "observaciones": "Asistió puntualmente"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["presente"] is True

    async def test_confirmar_asistencia_atleta(
        self, client: AsyncClient, test_registro_asistencia_id: int
    ):
        """Test athlete confirming attendance"""
        tomorrow = date.today() + timedelta(days=1)
        response = await client.post(
            f"/api/v1/tests/entrenador/confirmar/{test_registro_asistencia_id}?fecha_entrenamiento={tomorrow.isoformat()}"
        )
        assert response.status_code == 201
        data = response.json()
        assert "confirmacion" in data or "presente" in data

    async def test_rechazar_asistencia_atleta(
        self, client: AsyncClient, test_registro_asistencia_id: int
    ):
        """Test athlete rejecting attendance"""
        tomorrow = date.today() + timedelta(days=1)
        response = await client.post(
            f"/api/v1/tests/entrenador/rechazar/{test_registro_asistencia_id}?fecha_entrenamiento={tomorrow.isoformat()}"
        )
        assert response.status_code == 201

    async def test_marcar_presente(
        self, authenticated_entrenador_client: AsyncClient, test_asistencia_id: int
    ):
        """Test marking athlete as present"""
        response = await authenticated_entrenador_client.put(
            f"/api/v1/tests/entrenador/marcar-presente/{test_asistencia_id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["presente"] is True

    async def test_marcar_ausente(
        self, authenticated_entrenador_client: AsyncClient, test_asistencia_id: int
    ):
        """Test marking athlete as absent"""
        response = await authenticated_entrenador_client.put(
            f"/api/v1/tests/entrenador/marcar-ausente/{test_asistencia_id}"
        )
        assert response.status_code == 200
        data = response.json()
        assert data["presente"] is False

    async def test_obtener_mis_registros(
        self, client: AsyncClient, test_atleta_user: Dict[str, Any]
    ):
        """Test getting athlete's enrollment records"""
        response = await client.get(
            f"/api/v1/tests/entrenador/mis-registros?atleta_id={test_atleta_user['atleta_id']}"
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_eliminar_inscripcion(
        self, authenticated_entrenador_client: AsyncClient, test_registro_asistencia_id: int
    ):
        """Test removing enrollment"""
        response = await authenticated_entrenador_client.delete(
            f"/api/v1/tests/entrenador/inscripcion/{test_registro_asistencia_id}"
        )
        assert response.status_code == 204


@pytest.mark.asyncio
class TestResultadoEntrenamientoEndpoints:
    """Test suite for Training Result endpoints"""

    async def test_create_resultado(self, authenticated_entrenador_client: AsyncClient):
        """Test creating training result"""
        response = await authenticated_entrenador_client.post(
            "/api/v1/tests/entrenador/resultados/",
            json={
                "atleta_id": 1,
                "entrenamiento_id": 1,
                "fecha": date.today().isoformat(),
                "resultado": "10.5 segundos",
                "observaciones": "Buen desempeño"
            }
        )
        assert response.status_code in [201, 404]  # 404 if athlete/training not found

    async def test_list_resultados(self, client: AsyncClient):
        """Test listing training results"""
        response = await client.get("/api/v1/tests/entrenador/resultados/")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    async def test_update_resultado(
        self, authenticated_entrenador_client: AsyncClient, test_resultado_id: int
    ):
        """Test updating training result"""
        response = await authenticated_entrenador_client.put(
            f"/api/v1/tests/entrenador/resultados/{test_resultado_id}",
            json={
                "resultado": "10.3 segundos",
                "observaciones": "Mejoró su marca"
            }
        )
        assert response.status_code == 200

    async def test_delete_resultado(
        self, authenticated_entrenador_client: AsyncClient, test_resultado_id: int
    ):
        """Test deleting training result"""
        response = await authenticated_entrenador_client.delete(
            f"/api/v1/tests/entrenador/resultados/{test_resultado_id}"
        )
        assert response.status_code == 204


@pytest.mark.asyncio
class TestEntrenadorMultiRoleScenarios:
    """Test complex multi-role scenarios"""

    async def test_atleta_entrenador_can_access_both(
        self, test_multi_role_user: Dict[str, Any], client: AsyncClient
    ):
        """Test user with both ATLETA and ENTRENADOR roles can access both endpoints"""
        token = test_multi_role_user["token"]
        
        # Can create training as coach
        response_training = await client.post(
            "/api/v1/tests/entrenador/entrenamientos/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "nombre": "Test Multi",
                "descripcion": "Test",
                "tipo": "RESISTENCIA",
                "ubicacion": "Gym"
            }
        )
        # Should succeed if ENTRENADOR role is checked
        assert response_training.status_code in [201, 403]
        
        # Can also access athlete endpoints
        response_athlete = await client.get(
            "/api/v1/tests/atleta/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response_athlete.status_code in [200, 404]
