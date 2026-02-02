"""
Locust Load Testing Suite para Athletics Module API

Este módulo define escenarios de pruebas de carga usando Locust.

Uso:
    # Modo Web UI
    locust -f locustfile.py --host=http://localhost:8080
    
    # Modo Headless (sin UI)
    locust -f locustfile.py --host=http://localhost:8080 --users 100 --spawn-rate 10 --run-time 5m --headless
    
    # Modo Distribuido (Master)
    locust -f locustfile.py --master --expect-workers 4
    
    # Modo Distribuido (Worker)
    locust -f locustfile.py --worker --master-host=localhost
    
    # Exportar resultados
    locust -f locustfile.py --host=http://localhost:8080 --users 100 --spawn-rate 10 --run-time 5m --headless --html=report.html --csv=results
"""

from locust import HttpUser, task, between, SequentialTaskSet, events
from locust.exception import RescheduleTask
import sys
sys.path.append("/mnt")
import random
import json
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AuthenticationError(Exception):
    """Excepción cuando falla la autenticación."""
    pass


# ============================================================================
# TASK SETS - Conjuntos de tareas organizadas
# ============================================================================

class AuthFlowTaskSet(SequentialTaskSet):
    """
    Flujo secuencial de autenticación.
    Simula: Login -> Ver perfil -> Refresh token -> Logout
    """
    
    def on_start(self):
        """Inicialización al comenzar."""
        self.user_email = f"user{random.randint(1, 100)}@test.com"
        self.password = "Password123!"
        self.access_token = None
        self.refresh_token = None
    
    @task
    def login(self):
        """Realiza login y guarda tokens."""
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": self.user_email,
                "password": self.password
            },
            name="/api/v1/auth/login [POST]"
        )
        
        if response.status_code == 200:
            data = response.json()
            # Intentar extraer token de diferentes estructuras
            self.access_token = (
                data.get("access_token") or 
                data.get("data", {}).get("access_token") or
                data.get("token")
            )
            self.refresh_token = (
                data.get("refresh_token") or
                data.get("data", {}).get("refresh_token")
            )
            
            if self.access_token:
                logger.info(f"✅ Login exitoso para {self.user_email}")
                self.user.auth_token = self.access_token
            else:
                logger.warning(f"⚠️  Login exitoso pero no se encontró token")
        else:
            logger.error(f"❌ Login fallido: {response.status_code}")
            raise RescheduleTask()
    
    @task
    def get_profile(self):
        """Obtiene perfil del usuario autenticado."""
        if not self.access_token:
            logger.warning("No hay token disponible, saltando get_profile")
            raise RescheduleTask()
        
        self.client.get(
            "/api/v1/auth/users/me",
            headers={"Authorization": f"Bearer {self.access_token}"},
            name="/api/v1/auth/users/me [GET]"
        )
    
    @task
    def refresh_token_task(self):
        """Refresca el token de autenticación."""
        if not self.refresh_token:
            logger.info("No hay refresh token, saltando refresh")
            return
        
        response = self.client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": self.refresh_token},
            name="/api/v1/auth/refresh [POST]"
        )
        
        if response.status_code == 200:
            data = response.json()
            new_token = data.get("access_token") or data.get("data", {}).get("access_token")
            if new_token:
                self.access_token = new_token
                self.user.auth_token = new_token
                logger.info("✅ Token refrescado exitosamente")
    
    @task
    def logout(self):
        """Cierra sesión."""
        if self.access_token:
            self.client.post(
                "/api/v1/auth/logout",
                headers={"Authorization": f"Bearer {self.access_token}"},
                name="/api/v1/auth/logout [POST]"
            )
        
        # Finalizar este conjunto de tareas
        self.interrupt()


class AtletasCRUDTaskSet(SequentialTaskSet):
    """
    Operaciones CRUD sobre atletas.
    Requiere autenticación previa.
    """
    
    def on_start(self):
        """Autenticación al inicio."""
        self.atleta_id = None
        self.authenticate()
    
    def authenticate(self):
        """Autentica y guarda token."""
        if hasattr(self.user, 'auth_token') and self.user.auth_token:
            self.access_token = self.user.auth_token
            return
        
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": f"user{random.randint(1, 100)}@test.com",
                "password": "Password123!"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = (
                data.get("access_token") or 
                data.get("data", {}).get("access_token")
            )
            self.user.auth_token = self.access_token
        else:
            raise AuthenticationError("No se pudo autenticar")
    
    def get_auth_headers(self):
        """Retorna headers con autenticación."""
        return {"Authorization": f"Bearer {self.access_token}"}
    
    @task
    def list_atletas(self):
        """Lista atletas con paginación."""
        page = random.randint(1, 5)
        page_size = random.choice([10, 20, 50])
        
        self.client.get(
            f"/api/v1/atleta/?page={page}&page_size={page_size}",
            headers=self.get_auth_headers(),
            name="/api/v1/atleta/ [GET] (list)"
        )
    
    @task
    def create_atleta(self):
        """Crea un nuevo atleta."""
        from utils.utils import generar_atleta
        
        atleta_data = generar_atleta()
        
        response = self.client.post(
            "/api/v1/atleta/",
            json=atleta_data,
            headers=self.get_auth_headers(),
            name="/api/v1/atleta/ [POST] (create)"
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            # Intentar extraer ID del atleta creado
            self.atleta_id = (
                data.get("id") or 
                data.get("data", {}).get("id") or
                data.get("atleta_id")
            )
            logger.info(f"✅ Atleta creado con ID: {self.atleta_id}")
    
    @task
    def get_atleta_detail(self):
        """Obtiene detalle de un atleta específico."""
        if not self.atleta_id:
            # Usar un ID aleatorio si no tenemos uno
            atleta_id = random.randint(1, 100)
        else:
            atleta_id = self.atleta_id
        
        self.client.get(
            f"/api/v1/atleta/{atleta_id}/",
            headers=self.get_auth_headers(),
            name="/api/v1/atleta/{id}/ [GET] (detail)"
        )
    
    @task
    def update_atleta(self):
        """Actualiza un atleta existente."""
        if not self.atleta_id:
            return
        
        update_data = {
            "peso": round(random.uniform(50, 90), 2),
            "altura": round(random.uniform(1.60, 1.95), 2)
        }
        
        self.client.put(
            f"/api/v1/atleta/{self.atleta_id}/",
            json=update_data,
            headers=self.get_auth_headers(),
            name="/api/v1/atleta/{id}/ [PUT] (update)"
        )
    
    @task
    def search_atletas(self):
        """Busca atletas por criterios."""
        search_params = random.choice([
            {"especialidad": "Velocidad"},
            {"categoria": "Sub-20"},
            {"nivel": "Intermedio"},
            {"nombre": "Juan"}
        ])
        
        query_string = "&".join([f"{k}={v}" for k, v in search_params.items()])
        
        self.client.get(
            f"/api/v1/atleta/search?{query_string}",
            headers=self.get_auth_headers(),
            name="/api/v1/atleta/search [GET]"
        )
    
    @task
    def delete_atleta(self):
        """Elimina un atleta (si tenemos ID)."""
        if self.atleta_id:
            self.client.delete(
                f"/api/v1/atleta/{self.atleta_id}/",
                headers=self.get_auth_headers(),
                name="/api/v1/atleta/{id}/ [DELETE]"
            )
            logger.info(f"🗑️  Atleta {self.atleta_id} eliminado")
            self.atleta_id = None
        
        # Finalizar este conjunto de tareas
        self.interrupt()


class EntrenamientosTaskSet(SequentialTaskSet):
    """Operaciones sobre entrenamientos."""
    
    def on_start(self):
        """Autenticación al inicio."""
        self.authenticate()
    
    def authenticate(self):
        """Autentica y guarda token."""
        if hasattr(self.user, 'auth_token') and self.user.auth_token:
            self.access_token = self.user.auth_token
            return
        
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": f"entrenador{random.randint(1, 2)}@test.com",
                "password": "Entrenador123!"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = (
                data.get("access_token") or 
                data.get("data", {}).get("access_token")
            )
            self.user.auth_token = self.access_token
        else:
            logger.error(f"❌ Login fallido para Entrenador: {response.status_code} - {response.text}")
            raise AuthenticationError("No se pudo autenticar")
    
    def get_auth_headers(self):
        """Retorna headers con autenticación."""
        return {"Authorization": f"Bearer {self.access_token}"}
    
    @task
    def list_entrenamientos(self):
        """Lista entrenamientos."""
        self.client.get(
            "/api/v1/entrenador/entrenamientos/",
            headers=self.get_auth_headers(),
            name="/api/v1/entrenador/entrenamientos/ [GET] (list)"
        )
    
    @task
    def create_entrenamiento(self):
        """Crea un entrenamiento."""
        from utils.utils import generar_entrenamiento
        
        entrenamiento_data = generar_entrenamiento()
        
        self.client.post(
            "/api/v1/entrenador/entrenamientos/",
            json=entrenamiento_data,
            headers=self.get_auth_headers(),
            name="/api/v1/entrenador/entrenamientos/ [POST] (create)"
        )
    
    @task
    def get_mis_entrenamientos(self):
        """Obtiene entrenamientos del entrenador actual."""
        self.client.get(
            "/api/v1/entrenador/entrenamientos/mis-entrenamientos",
            headers=self.get_auth_headers(),
            name="/api/v1/entrenador/entrenamientos/mis-entrenamientos [GET]"
        )
    
    @task
    def get_entrenamientos_disponibles(self):
        """Lista entrenamientos disponibles para inscripción."""
        self.client.get(
            "/api/v1/entrenador/entrenamientos/disponibles",
            headers=self.get_auth_headers(),
            name="/api/v1/entrenador/entrenamientos/disponibles [GET]"
        )
        
        # Finalizar
        self.interrupt()


# ============================================================================
# USER CLASSES - Tipos de usuarios simulados
# ============================================================================

class AthleticsWebsiteUser(HttpUser):
    """
    Usuario genérico que navega el sitio web de athletics.
    Realiza operaciones mixtas simulando un usuario real.
    """
    wait_time = between(1, 3)  # Espera entre 1-3 segundos entre tareas
    host = "http://localhost:8080"
    
    def on_start(self):
        """Se ejecuta al inicio de cada usuario."""
        self.auth_token = None
        logger.info(f"👤 Nuevo usuario iniciado (User ID: {id(self)})")
    
    @task(5)  # Peso 5 - se ejecuta más frecuentemente
    def view_atletas(self):
        """Ver listado de atletas (endpoint público)."""
        self.client.get(
            "/api/v1/atleta/",
            name="/api/v1/atleta/ [GET]"
        )
    
    @task(3)  # Peso 3
    def view_entrenamientos(self):
        """Ver entrenamientos disponibles."""
        self.client.get(
            "/api/v1/entrenador/entrenamientos/",
            name="/api/v1/entrenador/entrenamientos/ [GET]"
        )
    
    @task(2)  # Peso 2
    def search_atleta(self):
        """Buscar atletas."""
        nombres = ["Juan", "María", "Carlos", "Ana"]
        nombre = random.choice(nombres)
        
        self.client.get(
            f"/api/v1/atleta/search?nombre={nombre}",
            name="/api/v1/atleta/search [GET]"
        )
    
    @task(1)  # Peso 1 - menos frecuente
    def login_and_view_profile(self):
        """Login y ver perfil."""
        # Intentar login
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": f"user{random.randint(1, 100)}@test.com",
                "password": "Password123!"
            },
            name="/api/v1/auth/login [POST]"
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token") or data.get("data", {}).get("access_token")
            
            if token:
                # Ver perfil
                self.client.get(
                    "/api/v1/auth/users/me",
                    headers={"Authorization": f"Bearer {token}"},
                    name="/api/v1/auth/users/me [GET]"
                )


class AuthenticatedAtletaUser(HttpUser):
    """
    Usuario atleta autenticado que realiza operaciones avanzadas.
    """
    wait_time = between(2, 5)
    tasks = [AtletasCRUDTaskSet]
    
    def on_start(self):
        """Autenticación al inicio."""
        self.auth_token = None


class AuthenticatedEntrenadorUser(HttpUser):
    """
    Usuario entrenador que gestiona entrenamientos.
    """
    wait_time = between(2, 5)
    tasks = [EntrenamientosTaskSet]
    
    def on_start(self):
        """Autenticación al inicio."""
        self.auth_token = None


class AuthenticationFlowUser(HttpUser):
    """
    Usuario que solo prueba el flujo de autenticación.
    """
    wait_time = between(1, 2)
    tasks = [AuthFlowTaskSet]
    
    def on_start(self):
        """Inicialización."""
        self.auth_token = None


class MixedWorkloadUser(HttpUser):
    """
    Usuario con carga de trabajo mixta - simula comportamiento real.
    Combina diferentes tipos de operaciones con diferentes pesos.
    """
    wait_time = between(1, 4)
    host = "http://localhost:8080"
    
    def on_start(self):
        """Autenticación al inicio."""
        self.auth_token = None
        self.authenticate()
    
    def authenticate(self):
        """Realiza autenticación y guarda token."""
        response = self.client.post(
            "/api/v1/auth/login",
            json={
                "username": f"user{random.randint(1, 100)}@test.com",
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
        """Retorna headers de autenticación."""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    # READ operations (alta frecuencia)
    @task(10)
    def list_atletas(self):
        self.client.get("/api/v1/atleta/", headers=self.get_auth_headers())
    
    @task(8)
    def list_entrenamientos(self):
        self.client.get("/api/v1/entrenador/entrenamientos/", headers=self.get_auth_headers())
    
    @task(5)
    def get_atleta_detail(self):
        atleta_id = random.randint(1, 100)
        self.client.get(f"/api/v1/atleta/{atleta_id}/", headers=self.get_auth_headers())
    
    # WRITE operations (frecuencia media)
    @task(3)
    def create_atleta(self):
        from utils.utils import generar_atleta
        atleta_data = generar_atleta()
        self.client.post("/api/v1/atleta/", json=atleta_data, headers=self.get_auth_headers())
    
    @task(2)
    def update_atleta(self):
        atleta_id = random.randint(1, 100)
        update_data = {"peso": round(random.uniform(50, 90), 2)}
        self.client.put(f"/api/v1/atleta/{atleta_id}/", json=update_data, headers=self.get_auth_headers())
    
    # DELETE operations (baja frecuencia)
    @task(1)
    def delete_atleta(self):
        atleta_id = random.randint(1, 50)
        self.client.delete(f"/api/v1/atleta/{atleta_id}/", headers=self.get_auth_headers())


# ============================================================================
# EVENT HOOKS - Para estadísticas personalizadas
# ============================================================================

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Se ejecuta al inicio del test."""
    logger.info("🚀 ========================================")
    logger.info("🚀 INICIANDO STRESS TEST CON LOCUST")
    logger.info(f"🚀 Host: {environment.host}")
    logger.info(f"🚀 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("🚀 ========================================")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Se ejecuta al finalizar el test."""
    logger.info("🏁 ========================================")
    logger.info("🏁 TEST FINALIZADO")
    logger.info(f"🏁 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("🏁 ========================================")


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, context, **kwargs):
    """Hook que se ejecuta después de cada request."""
    # Log de requests lentos (>2 segundos)
    if response_time > 2000:
        logger.warning(f"⚠️  Request lento: {name} - {response_time}ms")
    
    # Log de errores
    if exception:
        logger.error(f"❌ Request fallido: {name} - {exception}")
