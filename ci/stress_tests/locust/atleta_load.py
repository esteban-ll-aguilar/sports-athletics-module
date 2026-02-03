"""
=================================================================
ATLETA MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/atleta_load.py
Uso: locust -f atleta_load.py --host=http://localhost:8081

Endpoints testeados (sin trailing slash):
  POST /api/v1/tests/atleta/           - Crear perfil atleta
  GET  /api/v1/tests/atleta/me         - Mi perfil
  GET  /api/v1/tests/atleta/historial  - Mi historial
  GET  /api/v1/tests/atleta/estadisticas - Mis estadísticas
  GET  /api/v1/tests/atleta/           - Listar atletas
  GET  /api/v1/tests/atleta/{id}       - Obtener atleta por ID
  PUT  /api/v1/tests/atleta/{id}       - Actualizar atleta
  
  GET  /api/v1/tests/atleta/historial-medico/ - Historial médico
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
ATLETA_PREFIX = f"{API_PREFIX}/atleta"


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class AtletaUser(HttpUser):
    """
    Usuario atleta que prueba endpoints de atleta.
    """
    wait_time = between(1, 3)
    weight = 2
    
    def on_start(self):
        """Setup: registrar y login como atleta"""
        self.token = None
        self.atleta_id = None
        self.username = f"atleta_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "AtletaTest123*"
        
        # Registrar usuario como ATLETA
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Atleta",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Atleta 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ATLETA"],
            "is_active": True
        }
        
        with self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            catch_response=True,
            name="[Setup] Register Atleta"
        ) as response:
            if response.status_code == 201:
                logger.info(f"✅ Atleta registrado: {self.user_email}")
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
        
        # Login
        self._do_login()
        
        # Crear perfil de atleta
        self._create_atleta_profile()
    
    def _do_login(self):
        """Login y guardar token (usa username, no email)"""
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={
                "username": self.user_email,
                "password": self.user_password
            },
            catch_response=True,
            name="[Setup] Login Atleta"
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
    
    def _create_atleta_profile(self):
        """Crear perfil de atleta"""
        if not self.token:
            return
        
        # Schema: AtletaCreate solo requiere anios_experiencia (int, 0-100)
        atleta_data = {
            "anios_experiencia": random.randint(0, 15)
        }
        
        with self.client.post(
            f"{ATLETA_PREFIX}/",
            json=atleta_data,
            headers=self._headers(),
            catch_response=True,
            name="[Setup] Create Atleta Profile"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    self.atleta_id = data.get("id") or data.get("data", {}).get("id")
                    response.success()
                except:
                    response.failure("Parse error")
            elif response.status_code == 400:
                # Ya existe perfil
                response.success()
            else:
                response.failure(f"Status {response.status_code}")
    
    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    @task(5)
    def task_get_my_profile(self):
        """Obtener mi perfil de atleta"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{ATLETA_PREFIX}/me",
            headers=self._headers(),
            name="Atleta - Get My Profile"
        )
    
    @task(3)
    def task_get_historial(self):
        """Obtener mi historial"""
        if not self.token:
            return
        
        self.client.get(
            f"{ATLETA_PREFIX}/historial",
            headers=self._headers(),
            name="Atleta - Get Historial"
        )
    
    @task(3)
    def task_get_estadisticas(self):
        """Obtener mis estadísticas"""
        if not self.token:
            return
        
        self.client.get(
            f"{ATLETA_PREFIX}/estadisticas",
            headers=self._headers(),
            name="Atleta - Get Estadisticas"
        )
    
    @task(2)
    def task_list_atletas(self):
        """Listar todos los atletas"""
        if not self.token:
            return
        
        skip = random.randint(0, 10)
        limit = random.choice([10, 20, 50])
        
        self.client.get(
            f"{ATLETA_PREFIX}/?skip={skip}&limit={limit}",
            headers=self._headers(),
            name="Atleta - List All"
        )
    
    @task(1)
    def task_get_atleta_by_id(self):
        """Obtener atleta por ID"""
        if not self.token or not self.atleta_id:
            return
        
        self.client.get(
            f"{ATLETA_PREFIX}/{self.atleta_id}",
            headers=self._headers(),
            name="Atleta - Get By ID"
        )


class AtletaReadOnlyUser(HttpUser):
    """
    Usuario que solo consulta atletas (público o con auth mínimo)
    """
    wait_time = between(2, 5)
    weight = 1
    
    def on_start(self):
        """Setup: registrar y login"""
        self.token = None
        self.username = f"reader_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "ReaderTest123*"
        
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Reader",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Reader 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ATLETA"],
            "is_active": True
        }
        
        self.client.post(f"{AUTH_PREFIX}/register", json=register_data)
        
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={"username": self.user_email, "password": self.user_password},
            catch_response=True,
            name="[Setup] Login Reader"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if "data" in data and data["data"]:
                    self.token = data["data"].get("access_token")
                response.success()
    
    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    @task(3)
    def task_list_atletas_paginated(self):
        """Listar atletas con paginación"""
        skip = random.randint(0, 50)
        limit = random.choice([10, 25, 50, 100])
        
        self.client.get(
            f"{ATLETA_PREFIX}/?skip={skip}&limit={limit}",
            headers=self._headers(),
            name="Atleta - List Paginated"
        )
    
    @task(2)
    def task_get_random_atleta(self):
        """Obtener atleta aleatorio"""
        atleta_id = random.randint(1, 20)
        
        self.client.get(
            f"{ATLETA_PREFIX}/{atleta_id}",
            headers=self._headers(),
            name="Atleta - Get Random ID"
        )
