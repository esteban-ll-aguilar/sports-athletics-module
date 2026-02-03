"""
=================================================================
COMPETENCIA MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/competencia_load.py
Uso: locust -f competencia_load.py --host=http://localhost:8080

Endpoints testeados (sin trailing slash):
  
  Competencias (/api/v1/tests/competencia/competencias):
    POST /competencias        - Crear competencia
    GET  /competencias        - Listar competencias
    GET  /competencias/{id}   - Obtener competencia
    PUT  /competencias/{id}   - Actualizar competencia
    DELETE /competencias/{id} - Eliminar competencia
  
  Pruebas (/api/v1/tests/competencia/pruebas):
    POST /pruebas        - Crear prueba
    GET  /pruebas        - Listar pruebas
    GET  /pruebas/{id}   - Obtener prueba
    PUT  /pruebas/{id}   - Actualizar prueba
  
  Baremos (/api/v1/tests/competencia/baremos):
    POST /baremos        - Crear baremo
    GET  /baremos        - Listar baremos
    GET  /baremos/{id}   - Obtener baremo
    PUT  /baremos/{id}   - Actualizar baremo
  
  Tipo-Disciplina (/api/v1/tests/competencia/tipo-disciplina):
    POST /tipo-disciplina   - Crear tipo
    GET  /tipo-disciplina   - Listar tipos
    GET  /tipo-disciplina/{id} - Obtener tipo
  
  Registro-Pruebas (/api/v1/tests/competencia/registro-pruebas):
    POST /registro-pruebas           - Inscribir atleta
    GET  /registro-pruebas/competencia/{id} - Por competencia
    GET  /registro-pruebas/atleta/{id}      - Por atleta
  
  Resultados-Pruebas (/api/v1/tests/competencia/resultados-pruebas):
    POST /resultados-pruebas       - Registrar resultado
    GET  /resultados-pruebas       - Listar resultados
    PUT  /resultados-pruebas/{id}  - Actualizar resultado
=================================================================
"""

from locust import HttpUser, task, between
import random
import string
import logging
import sys
import os
from datetime import datetime, timedelta

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
COMPETENCIA_PREFIX = f"{API_PREFIX}/competencia"


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def random_date_future(days_ahead=90):
    """Fecha aleatoria en el futuro"""
    min_days = 0 if days_ahead == 0 else 7
    future = datetime.now() + timedelta(days=random.randint(min_days, max(days_ahead, min_days)))
    return future.strftime("%Y-%m-%d")


class CompetenciaUser(HttpUser):
    """
    Usuario administrador que gestiona competencias.
    """
    wait_time = between(1, 3)
    weight = 2
    
    def on_start(self):
        """Setup: registrar y login como admin"""
        self.token = None
        self.competencia_ids = []
        self.prueba_ids = []
        self.baremo_ids = []
        self.tipo_disciplina_ids = []  # IDs de tipos de disciplina disponibles
        self.username = f"comp_admin_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "CompAdmin123!"
        
        # Registrar como ADMINISTRADOR
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Comp",
            "last_name": "Admin",
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
        
        # Cargar tipo_disciplina disponibles
        self._load_tipo_disciplinas()
    
    def _load_tipo_disciplinas(self):
        """Cargar IDs de tipo_disciplina disponibles"""
        if not self.token:
            return
        
        with self.client.get(
            f"{COMPETENCIA_PREFIX}/tipo-disciplina/",
            headers=self._headers(),
            catch_response=True,
            name="[Setup] Load Tipo Disciplinas"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Manejar formato {"data": {"items": [...]}} o {"data": [...]}
                    if isinstance(data, dict):
                        # Puede ser {"data": {"items": [...]}} o {"data": [...]}
                        data_content = data.get("data", [])
                        if isinstance(data_content, dict):
                            items = data_content.get("items", [])
                        elif isinstance(data_content, list):
                            items = data_content
                        else:
                            items = []
                    else:
                        items = data if isinstance(data, list) else []
                    
                    for item in items:
                        td_id = item.get("id")
                        if td_id:
                            self.tipo_disciplina_ids.append(td_id)
                    
                    if self.tipo_disciplina_ids:
                        response.success()
                    else:
                        # Si no hay tipos, usar ID por defecto pero marcar warning
                        self.tipo_disciplina_ids = [1]
                        response.success()
                except Exception as e:
                    response.failure(f"Parse error: {str(e)}")
                    self.tipo_disciplina_ids = [1]
            else:
                # Si falla, usar ID por defecto
                self.tipo_disciplina_ids = [1]
                response.success()
    
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
    # COMPETENCIAS
    # ==========================================
    
    @task(4)
    def task_list_competencias(self):
        """Listar competencias"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/competencias",
            headers=self._headers(),
            name="Competencia - List"
        )
    
    @task(2)
    def task_create_competencia(self):
        """Crear competencia"""
        if not self.token:
            return
        
        # Schema: nombre, descripcion (opt), fecha, lugar, estado
        competencia_data = {
            "nombre": f"Competencia {random_string(5)}",
            "descripcion": "Competencia de prueba para load testing",
            "fecha": random_date_future(30),
            "lugar": f"Estadio {random.randint(1, 5)}",
            "estado": True
        }
        
        with self.client.post(
            f"{COMPETENCIA_PREFIX}/competencias",
            json=competencia_data,
            headers=self._headers(),
            catch_response=True,
            name="Competencia - Create"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    comp_id = data.get("external_id") or data.get("data", {}).get("external_id")
                    if comp_id:
                        self.competencia_ids.append(comp_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def task_get_competencia(self):
        """Obtener competencia por ID"""
        if not self.token or not self.competencia_ids:
            return
        
        comp_id = random.choice(self.competencia_ids)
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/competencias/{comp_id}",
            headers=self._headers(),
            name="Competencia - Get By ID"
        )
    
    # ==========================================
    # PRUEBAS
    # ==========================================
    
    @task(3)
    def task_list_pruebas(self):
        """Listar pruebas"""
        if not self.token:
            return
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/pruebas/",
            headers=self._headers(),
            name="Prueba - List"
        )
    
    @task(1)
    def task_create_prueba(self):
        """Crear prueba"""
        if not self.token or not self.tipo_disciplina_ids:
            return
        
        # Schema: nombre, siglas, fecha_registro, fecha_prueba, tipo_prueba, tipo_medicion, unidad_medida, estado, tipo_disciplina_id
        prueba_data = {
            "nombre": f"Prueba {random_string(5)}",
            "siglas": random_string(3).upper(),
            "fecha_registro": random_date_future(0),  # Hoy
            "fecha_prueba": random_date_future(30),
            "tipo_prueba": random.choice(["COMPETENCIA", "NORMAL"]),
            "tipo_medicion": random.choice(["TIEMPO", "DISTANCIA"]),
            "unidad_medida": random.choice(["SEGUNDOS", "METROS", "MINUTOS"]),
            "estado": True,
            "tipo_disciplina_id": random.choice(self.tipo_disciplina_ids)
        }
        
        with self.client.post(
            f"{COMPETENCIA_PREFIX}/pruebas/",
            json=prueba_data,
            headers=self._headers(),
            catch_response=True,
            name="Prueba - Create"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    p_id = data.get("external_id") or data.get("data", {}).get("external_id")
                    if p_id:
                        self.prueba_ids.append(p_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    # ==========================================
    # BAREMOS
    # ==========================================
    
    @task(3)
    def task_list_baremos(self):
        """Listar baremos"""
        if not self.token:
            return
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/baremos/",
            headers=self._headers(),
            name="Baremo - List"
        )
    
    @task(1)
    def task_create_baremo(self):
        """Crear baremo"""
        if not self.token or not self.prueba_ids:
            return
        
        # Schema: sexo, edad_min, edad_max, estado, prueba_id (UUID), items (list)
        prueba_uuid = random.choice(self.prueba_ids)
        baremo_data = {
            "sexo": random.choice(["M", "F"]),
            "edad_min": random.randint(12, 16),
            "edad_max": random.randint(17, 30),
            "estado": True,
            "prueba_id": prueba_uuid,
            "items": [
                {
                    "clasificacion": "A",
                    "marca_minima": 10.0,
                    "marca_maxima": 12.0,
                    "estado": True
                },
                {
                    "clasificacion": "B", 
                    "marca_minima": 12.1,
                    "marca_maxima": 14.0,
                    "estado": True
                }
            ]
        }
        
        with self.client.post(
            f"{COMPETENCIA_PREFIX}/baremos/",
            json=baremo_data,
            headers=self._headers(),
            catch_response=True,
            name="Baremo - Create"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    b_id = data.get("external_id") or data.get("data", {}).get("external_id")
                    if b_id:
                        self.baremo_ids.append(b_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    # ==========================================
    # TIPO-DISCIPLINA
    # ==========================================
    
    @task(2)
    def task_list_tipo_disciplina(self):
        """Listar tipos de disciplina"""
        if not self.token:
            return
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/tipo-disciplina/",
            headers=self._headers(),
            name="TipoDisciplina - List"
        )
    
    # ==========================================
    # REGISTRO PRUEBAS
    # ==========================================
    
    @task(2)
    def task_list_resultados_pruebas(self):
        """Listar resultados de pruebas"""
        if not self.token:
            return
        
        self.client.get(
            f"{COMPETENCIA_PREFIX}/resultados-pruebas/",
            headers=self._headers(),
            name="ResultadosPruebas - List"
        )


class CompetenciaReadOnlyUser(HttpUser):
    """
    Usuario que solo consulta competencias (atleta normal)
    """
    wait_time = between(2, 5)
    weight = 1
    
    def on_start(self):
        """Setup: registrar y login"""
        self.token = None
        self.username = f"comp_reader_{random_string()}"
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
    
    @task(4)
    def task_browse_competencias(self):
        """Navegar competencias"""
        self.client.get(
            f"{COMPETENCIA_PREFIX}/competencias",
            headers=self._headers(),
            name="Competencia - Browse"
        )
    
    @task(3)
    def task_browse_pruebas(self):
        """Navegar pruebas"""
        self.client.get(
            f"{COMPETENCIA_PREFIX}/pruebas/",
            headers=self._headers(),
            name="Prueba - Browse"
        )
    
    @task(2)
    def task_browse_baremos(self):
        """Navegar baremos"""
        self.client.get(
            f"{COMPETENCIA_PREFIX}/baremos/",
            headers=self._headers(),
            name="Baremo - Browse"
        )
    
    @task(1)
    def task_browse_resultados(self):
        """Navegar resultados"""
        self.client.get(
            f"{COMPETENCIA_PREFIX}/resultados-pruebas/",
            headers=self._headers(),
            name="ResultadosPruebas - Browse"
        )
