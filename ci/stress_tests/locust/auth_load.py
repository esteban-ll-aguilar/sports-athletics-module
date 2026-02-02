"""
=================================================================
AUTH MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/auth_load.py
Uso: locust -f auth_load.py --host=http://localhost:8081

Endpoints testeados (sin trailing slash):
  POST /api/v1/tests/auth/register - Registro de usuarios
  POST /api/v1/tests/auth/login    - Login
  POST /api/v1/tests/auth/logout   - Logout
  POST /api/v1/tests/auth/refresh  - Refresh token
  GET  /api/v1/tests/auth/profile  - Perfil del usuario
=================================================================
"""

from locust import HttpUser, task, between
import random
import string
import logging
import sys
import os

# Configurar path para imports (funciona en Docker y local)
if os.path.exists('/mnt/utils'):
    sys.path.insert(0, '/mnt')
else:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.utils import generar_cedula_ecuador

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Configuration - SIN trailing slashes
API_PREFIX = "/api/v1/tests"
AUTH_PREFIX = f"{API_PREFIX}/auth"


def random_string(length=8):
    """Generate random string for unique data"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class AuthUser(HttpUser):
    """
    Usuario que prueba el flujo completo de autenticación.
    Incluye: registro, login, refresh, profile, logout
    """
    wait_time = between(1, 3)
    weight = 3
    
    def on_start(self):
        """Setup: crear usuario y hacer login"""
        self.token = None
        self.refresh_token = None
        self.username = f"auth_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "TestPassword123!"
        
        # Registrar usuario de prueba
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Auth",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Test 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ATLETA"],
            "is_active": True
        }
        
        with self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            catch_response=True,
            name="[Setup] Register"
        ) as response:
            if response.status_code == 201:
                logger.info(f"✅ Usuario registrado: {self.user_email}")
                response.success()
            elif response.status_code == 307:
                logger.error(f"❌ REDIRECT 307 - Revisar trailing slashes")
                response.failure("Redirect 307")
            else:
                logger.warning(f"⚠️ Registro: {response.status_code}")
                response.failure(f"Status {response.status_code}")
        
        # Login inicial
        self._do_login()
    
    def _do_login(self):
        """Realizar login y guardar tokens (usa username, no email)"""
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={
                "username": self.user_email,
                "password": self.user_password
            },
            catch_response=True,
            name="[Setup] Login"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "data" in data and data["data"]:
                        self.token = data["data"].get("access_token")
                        self.refresh_token = data["data"].get("refresh_token")
                        response.success()
                    else:
                        response.failure("No token in response")
                except Exception as e:
                    response.failure(f"JSON error: {e}")
            else:
                response.failure(f"Status {response.status_code}")
    
    def _headers(self):
        """Headers con autorización"""
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    @task(5)
    def task_login(self):
        """Tarea: Login"""
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={
                "username": self.user_email,
                "password": self.user_password
            },
            catch_response=True,
            name="Auth - Login"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "data" in data and data["data"]:
                        self.token = data["data"].get("access_token")
                        self.refresh_token = data["data"].get("refresh_token")
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(3)
    def task_profile(self):
        """Tarea: Obtener perfil"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{AUTH_PREFIX}/profile",
            headers=self._headers(),
            name="Auth - Profile"
        )
    
    @task(2)
    def task_refresh(self):
        """Tarea: Refresh token"""
        if not self.refresh_token:
            return
        
        with self.client.post(
            f"{AUTH_PREFIX}/refresh",
            json={"refresh_token": self.refresh_token},
            catch_response=True,
            name="Auth - Refresh"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "data" in data and data["data"]:
                        self.token = data["data"].get("access_token")
                        self.refresh_token = data["data"].get("refresh_token")
                    response.success()
                except:
                    response.failure("Parse error")
    
    @task(1)
    def task_logout_login(self):
        """Tarea: Logout y re-login"""
        if self.token:
            self.client.post(
                f"{AUTH_PREFIX}/logout",
                headers=self._headers(),
                name="Auth - Logout"
            )
            self.token = None
            self.refresh_token = None
        
        self._do_login()


class AuthRegistrationUser(HttpUser):
    """
    Usuario que solo hace registros (stress de registro)
    """
    wait_time = between(2, 5)
    weight = 1
    
    @task
    def task_register_new_user(self):
        """Registrar usuario nuevo"""
        uid = random_string()
        register_data = {
            "email": f"reg_{uid}@test.com",
            "password": "RegisterTest123*",
            "username": f"reg_{uid}",
            "first_name": "Register",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Register 456",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ATLETA"],
            "is_active": True
        }
        
        self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            name="Auth - Register New"
        )
