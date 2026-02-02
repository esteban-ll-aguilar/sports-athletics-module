"""
Escenarios de prueba específicos para Locust.

Este módulo contiene escenarios predefinidos para diferentes tipos de pruebas:
- Smoke Test
- Load Test
- Stress Test
- Spike Test
- Soak Test
"""

from locust import HttpUser, task, between, constant, constant_pacing
import sys
import os

# Agregar path para imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locust.locustfile import MixedWorkloadUser


class SmokeTestUser(MixedWorkloadUser):
    """
    Smoke Test - Verificación básica de funcionalidad.
    Configuración: 10 usuarios, 2 usuarios/seg, 2 minutos
    """
    wait_time = between(2, 4)
    weight = 1


class LoadTestUser(MixedWorkloadUser):
    """
    Load Test - Carga normal esperada.
    Configuración: 100 usuarios, 10 usuarios/seg, 10 minutos
    """
    wait_time = between(1, 3)
    weight = 3


class StressTestUser(MixedWorkloadUser):
    """
    Stress Test - Carga alta para encontrar límites.
    Configuración: 500 usuarios, 25 usuarios/seg, 15 minutos
    """
    wait_time = between(0.5, 2)
    weight = 5


class SpikeTestUser(MixedWorkloadUser):
    """
    Spike Test - Picos repentinos de carga.
    Configuración: 300 usuarios, 100 usuarios/seg, 5 minutos
    """
    wait_time = between(1, 2)
    weight = 2


class SoakTestUser(MixedWorkloadUser):
    """
    Soak Test - Prueba de resistencia prolongada.
    Configuración: 150 usuarios, 15 usuarios/seg, 60 minutos
    """
    wait_time = between(2, 5)
    weight = 2


# ============================================================================
# ESCENARIOS ESPECÍFICOS POR ENDPOINT
# ============================================================================

class ReadOnlyUser(HttpUser):
    """
    Usuario de solo lectura - simula navegación sin modificaciones.
    Ideal para probar carga en endpoints de consulta.
    """
    wait_time = between(1, 2)
    host = "http://localhost:8080"
    weight = 5
    
    @task(10)
    def list_atletas(self):
        self.client.get("/api/v1/atleta/")
    
    @task(8)
    def list_entrenamientos(self):
        self.client.get("/api/v1/entrenador/entrenamientos/")
    
    @task(5)
    def get_atleta_detail(self):
        import random
        atleta_id = random.randint(1, 100)
        self.client.get(f"/api/v1/atleta/{atleta_id}/")
    
    @task(3)
    def search_atletas(self):
        import random
        nombres = ["Juan", "María", "Carlos", "Ana", "Luis"]
        nombre = random.choice(nombres)
        self.client.get(f"/api/v1/atleta/search?nombre={nombre}")


class WriteHeavyUser(HttpUser):
    """
    Usuario con alta escritura - prueba operaciones POST/PUT/DELETE.
    """
    wait_time = between(2, 4)
    host = "http://localhost:8080"
    weight = 2
    
    def on_start(self):
        """Autenticación al inicio."""
        self.auth_token = None
        self.authenticate()
    
    def authenticate(self):
        """Obtiene token de autenticación."""
        import random
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "email": f"user{random.randint(1, 100)}@test.com",
                "password": "Password123!"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.auth_token = (
                data.get("access_token") or 
                data.get("data", {}).get("access_token")
            )
    
    def get_auth_headers(self):
        """Headers con autenticación."""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    @task(5)
    def create_atleta(self):
        """Crea atletas continuamente."""
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from utils.utils import generar_atleta
        
        atleta_data = generar_atleta()
        self.client.post(
            "/api/v1/atleta/",
            json=atleta_data,
            headers=self.get_auth_headers()
        )
    
    @task(3)
    def update_atleta(self):
        """Actualiza atletas."""
        import random
        atleta_id = random.randint(1, 100)
        update_data = {
            "peso": round(random.uniform(50, 90), 2),
            "altura": round(random.uniform(1.60, 1.95), 2)
        }
        self.client.put(
            f"/api/v1/atleta/{atleta_id}/",
            json=update_data,
            headers=self.get_auth_headers()
        )
    
    @task(1)
    def delete_atleta(self):
        """Elimina atletas."""
        import random
        atleta_id = random.randint(1, 50)
        self.client.delete(
            f"/api/v1/atleta/{atleta_id}/",
            headers=self.get_auth_headers()
        )


class AuthenticationStressUser(HttpUser):
    """
    Usuario que solo hace login/logout repetitivos.
    Prueba el sistema de autenticación específicamente.
    """
    wait_time = constant(1)  # Constante 1 segundo entre requests
    host = "http://localhost:8080"
    weight = 1
    
    @task
    def login_logout_cycle(self):
        """Ciclo completo de login y logout."""
        import random
        
        # Login
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "email": f"user{random.randint(1, 100)}@test.com",
                "password": "Password123!"
            },
            name="auth_cycle_login"
        )
        
        if response.status_code == 200:
            data = response.json()
            token = (
                data.get("access_token") or 
                data.get("data", {}).get("access_token")
            )
            
            if token:
                # Logout
                self.client.post(
                    "/api/v1/auth/logout",
                    headers={"Authorization": f"Bearer {token}"},
                    name="auth_cycle_logout"
                )


class RateLimitTestUser(HttpUser):
    """
    Usuario que intenta generar rate limiting.
    Hace requests muy rápidos para probar protecciones.
    """
    wait_time = constant(0.1)  # 100ms entre requests (muy rápido)
    host = "http://localhost:8080"
    weight = 1
    
    @task
    def rapid_fire_requests(self):
        """Envía requests rápidos."""
        import random
        
        endpoints = [
            "/api/v1/atleta/",
            "/api/v1/entrenador/entrenamientos/",
            "/api/v1/competencia/competencias/"
        ]
        
        endpoint = random.choice(endpoints)
        self.client.get(endpoint, name="rate_limit_test")
