
"""
=================================================================
ADMIN MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/admin_load.py
Uso: locust -f admin_load.py --host=http://localhost:8080

Endpoints testeados (sin trailing slash):
  
  JWT Management:
    GET  /api/v1/tests/admin/jwt/rotation-info  - Info de rotación
    POST /api/v1/tests/admin/jwt/rotate-secret  - Rotar secret (cuidado)
  
  NOTA: El módulo admin tiene pocas rutas y son sensibles.
  Este archivo es principalmente para probar permisos.
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
ADMIN_PREFIX = f"{API_PREFIX}/admin"


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class AdminUser(HttpUser):
    """
    Usuario administrador que consulta estado del sistema.
    """
    wait_time = between(2, 5)
    weight = 1
    
    def on_start(self):
        """Setup: registrar y login como admin"""
        self.token = None
        self.username = f"admin_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "AdminTest123*"
        
        # Registrar como ADMINISTRADOR
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Admin",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ADMINISTRATIVOS",
            "direccion": "Calle Admin 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ADMINISTRADOR"],
            "is_active": True
        }
        
        with self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            catch_response=True,
            name="[Setup] Register Admin"
        ) as response:
            if response.status_code == 201:
                logger.info(f"✅ Admin registrado: {self.user_email}")
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
        
        # Login
        self._do_login()
    
    def _do_login(self):
        """Login y guardar token (usa username, no email)"""
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={
                "username": self.user_email,
                "password": self.user_password
            },
            catch_response=True,
            name="[Setup] Login Admin"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if "data" in data and data["data"]:
                        self.token = data["data"].get("access_token")
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    # ==========================================
    # JWT MANAGEMENT
    # ==========================================
    
    @task(5)
    def task_get_jwt_rotation_info(self):
        """Obtener información de rotación JWT"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{ADMIN_PREFIX}/jwt/rotation-info",
            headers=self._headers(),
            name="Admin - JWT Rotation Info"
        )
    
    # NOTA: No incluimos rotate-secret como tarea normal
    # porque puede afectar el sistema. Solo para pruebas específicas.
    
    @task(1)
    def task_check_auth_profile(self):
        """Verificar perfil (para mantener sesión activa)"""
        if not self.token:
            return
        
        self.client.get(
            f"{AUTH_PREFIX}/profile",
            headers=self._headers(),
            name="Admin - Check Profile"
        )


class AdminAccessDeniedUser(HttpUser):
    """
    Usuario NO admin intentando acceder a rutas admin.
    Para verificar que los permisos funcionan correctamente.
    """
    wait_time = between(3, 7)
    weight = 1
    
    def on_start(self):
        """Setup: registrar como atleta"""
        self.token = None
        self.username = f"fake_admin_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "FakeAdmin123!"
        
        # Registrar como ATLETA (sin permisos admin)
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Fake",
            "last_name": "Admin",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Fake 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ATLETA"],  # NO ADMIN
            "is_active": True
        }
        
        self.client.post(f"{AUTH_PREFIX}/register", json=register_data)
        
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={"username": self.user_email, "password": self.user_password},
            catch_response=True,
            name="[Setup] Login Fake Admin"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if "data" in data and data["data"]:
                    self.token = data["data"].get("access_token")
                response.success()
    
    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    @task
    def task_try_admin_route(self):
        """Intentar acceder a ruta admin (debe fallar con 403)"""
        with self.client.get(
            f"{ADMIN_PREFIX}/jwt/rotation-info",
            headers=self._headers(),
            catch_response=True,
            name="Admin - Access Denied Test"
        ) as response:
            # Esperamos 401 o 403
            if response.status_code in [401, 403]:
                response.success()  # Es el comportamiento esperado
            elif response.status_code == 200:
                response.failure("Should be denied - security issue!")
            else:
                response.failure(f"Unexpected status: {response.status_code}")
