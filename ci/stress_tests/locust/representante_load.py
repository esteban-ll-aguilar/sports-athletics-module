"""
=================================================================
REPRESENTANTE MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/representante_load.py
Uso: locust -f representante_load.py --host=http://localhost:8080

Endpoints testeados (sin trailing slash):
  
  Gestión de Atletas Hijos:
    POST /api/v1/tests/representante/athletes          - Registrar atleta hijo
    PUT  /api/v1/tests/representante/athletes/{id}     - Actualizar atleta hijo
    GET  /api/v1/tests/representante/athletes          - Listar mis atletas
    GET  /api/v1/tests/representante/athletes/{id}     - Detalle de atleta
    GET  /api/v1/tests/representante/athletes/{id}/historial    - Historial
    GET  /api/v1/tests/representante/athletes/{id}/estadisticas - Estadísticas
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
REPRESENTANTE_PREFIX = f"{API_PREFIX}/representante"


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


class RepresentanteUser(HttpUser):
    """
    Usuario representante que gestiona atletas hijos.
    """
    wait_time = between(1, 3)
    weight = 2
    
    def on_start(self):
        """Setup: registrar y login como representante"""
        self.token = None
        self.atleta_hijo_ids = []
        self.username = f"rep_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "RepTest123*"
        
        # Registrar como REPRESENTANTE
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Representante",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "EXTERNOS",
            "direccion": "Calle Representante 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["REPRESENTANTE"],
            "is_active": True
        }
        
        with self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            catch_response=True,
            name="[Setup] Register Representante"
        ) as response:
            if response.status_code == 201:
                logger.info(f"✅ Representante registrado: {self.user_email}")
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
            name="[Setup] Login Representante"
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
    # GESTIÓN DE ATLETAS HIJOS
    # ==========================================
    
    @task(4)
    def task_list_my_athletes(self):
        """Listar mis atletas"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{REPRESENTANTE_PREFIX}/athletes",
            headers=self._headers(),
            name="Representante - List Athletes"
        )
    
    @task(2)
    def task_register_child_athlete(self):
        """Registrar atleta hijo"""
        if not self.token:
            return
        
        uid = random_string()
        child_data = {
            "email": f"hijo_{uid}@test.com",
            "password": "HijoTest123*",
            "username": f"hijo_{uid}",
            "first_name": "Hijo",
            "last_name": f"Test_{uid}",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTES",
            "direccion": "Calle Hijo 123",
            "phone": f"09{random.randint(10000000, 99999999)}"
        }
        
        with self.client.post(
            f"{REPRESENTANTE_PREFIX}/athletes",
            json=child_data,
            headers=self._headers(),
            catch_response=True,
            name="Representante - Register Child"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    atleta_id = data.get("data", {}).get("id") if "data" in data else data.get("id")
                    if atleta_id:
                        self.atleta_hijo_ids.append(atleta_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(3)
    def task_get_child_detail(self):
        """Obtener detalle de atleta hijo"""
        if not self.token or not self.atleta_hijo_ids:
            return
        
        atleta_id = random.choice(self.atleta_hijo_ids)
        
        self.client.get(
            f"{REPRESENTANTE_PREFIX}/athletes/{atleta_id}",
            headers=self._headers(),
            name="Representante - Get Child Detail"
        )
    
    @task(2)
    def task_get_child_historial(self):
        """Obtener historial del atleta hijo"""
        if not self.token or not self.atleta_hijo_ids:
            return
        
        atleta_id = random.choice(self.atleta_hijo_ids)
        
        self.client.get(
            f"{REPRESENTANTE_PREFIX}/athletes/{atleta_id}/historial",
            headers=self._headers(),
            name="Representante - Get Child Historial"
        )
    
    @task(2)
    def task_get_child_stats(self):
        """Obtener estadísticas del atleta hijo"""
        if not self.token or not self.atleta_hijo_ids:
            return
        
        atleta_id = random.choice(self.atleta_hijo_ids)
        
        self.client.get(
            f"{REPRESENTANTE_PREFIX}/athletes/{atleta_id}/estadisticas",
            headers=self._headers(),
            name="Representante - Get Child Stats"
        )
    
    @task(1)
    def task_update_child(self):
        """Actualizar datos del atleta hijo"""
        if not self.token or not self.atleta_hijo_ids:
            return
        
        atleta_id = random.choice(self.atleta_hijo_ids)
        
        update_data = {
            "first_name": f"Hijo_{random_string(4)}",
            "last_name": f"Updated_{random_string(4)}",
            "phone": f"09{random.randint(10000000, 99999999)}"
        }
        
        self.client.put(
            f"{REPRESENTANTE_PREFIX}/athletes/{atleta_id}",
            json=update_data,
            headers=self._headers(),
            name="Representante - Update Child"
        )


class RepresentanteReadOnlyUser(HttpUser):
    """
    Representante que solo consulta (sin registrar hijos)
    """
    wait_time = between(2, 5)
    weight = 1
    
    def on_start(self):
        """Setup: registrar y login"""
        self.token = None
        self.username = f"rep_ro_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "RepReadOnly123*"
        
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "RepRO",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "EXTERNOS",
            "direccion": "Calle RO 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["REPRESENTANTE"],
            "is_active": True
        }
        
        self.client.post(f"{AUTH_PREFIX}/register", json=register_data)
        
        with self.client.post(
            f"{AUTH_PREFIX}/login",
            json={"username": self.user_email, "password": self.user_password},
            catch_response=True,
            name="[Setup] Login RepRO"
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if "data" in data and data["data"]:
                    self.token = data["data"].get("access_token")
                response.success()
    
    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}
    
    @task
    def task_list_athletes(self):
        """Listar atletas (probablemente vacío)"""
        self.client.get(
            f"{REPRESENTANTE_PREFIX}/athletes",
            headers=self._headers(),
            name="Representante - List (RO)"
        )
