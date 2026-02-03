"""
=================================================================
ENTRENADOR MODULE LOAD TEST
=================================================================
Archivo: ci/stress_tests/locust/entrenador_load.py
Uso: locust -f entrenador_load.py --host=http://localhost:8081

Endpoints testeados (sin trailing slash):
  
  Entrenamientos:
    POST /api/v1/tests/entrenador/            - Crear entrenamiento
    GET  /api/v1/tests/entrenador/            - Listar entrenamientos
    GET  /api/v1/tests/entrenador/{id}        - Obtener entrenamiento
    PUT  /api/v1/tests/entrenador/{id}        - Actualizar entrenamiento
    DELETE /api/v1/tests/entrenador/{id}      - Eliminar entrenamiento
  
  Horarios:
    POST /api/v1/tests/entrenador/entrenamiento/{id}  - Crear horario
    GET  /api/v1/tests/entrenador/entrenamiento/{id}  - Listar horarios
    DELETE /api/v1/tests/entrenador/{id}              - Eliminar horario
  
  Asistencias:
    POST /api/v1/tests/entrenador/inscripcion          - Inscribir atleta
    GET  /api/v1/tests/entrenador/inscripcion/horario/{id} - Inscripciones
    GET  /api/v1/tests/entrenador/mis-registros        - Mis registros
    POST /api/v1/tests/entrenador/registro             - Registrar asistencia
    POST /api/v1/tests/entrenador/confirmar/{id}       - Confirmar
    POST /api/v1/tests/entrenador/rechazar/{id}        - Rechazar
  
  Resultados:
    GET  /api/v1/tests/entrenador/            - Listar resultados
    POST /api/v1/tests/entrenador/            - Crear resultado
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
ENTRENADOR_PREFIX = f"{API_PREFIX}/entrenador"


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def random_date_future(days_ahead=30):
    """Fecha aleatoria en el futuro"""
    future = datetime.now() + timedelta(days=random.randint(1, days_ahead))
    return future.strftime("%Y-%m-%d")


def random_time():
    """Hora aleatoria"""
    hour = random.randint(6, 20)
    minute = random.choice([0, 15, 30, 45])
    return f"{hour:02d}:{minute:02d}:00"


class EntrenadorUser(HttpUser):
    """
    Usuario entrenador que gestiona entrenamientos, horarios y asistencias.
    """
    wait_time = between(1, 3)
    weight = 2
    
    def on_start(self):
        """Setup: registrar y login como entrenador"""
        self.token = None
        self.entrenamiento_ids = []
        self.horario_ids = []
        self.username = f"entrenador_{random_string()}"
        self.user_email = f"{self.username}@test.com"
        self.user_password = "EntrenadorTest123*"
        
        # Registrar como ENTRENADOR
        register_data = {
            "email": self.user_email,
            "password": self.user_password,
            "username": self.user_email,
            "first_name": "Entrenador",
            "last_name": "Test",
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "DOCENTES",
            "direccion": "Calle Entrenador 123",
            "phone": f"09{random.randint(10000000, 99999999)}",
            "roles": ["ENTRENADOR"],
            "is_active": True
        }
        
        with self.client.post(
            f"{AUTH_PREFIX}/register",
            json=register_data,
            catch_response=True,
            name="[Setup] Register Entrenador"
        ) as response:
            if response.status_code == 201:
                logger.info(f"✅ Entrenador registrado: {self.user_email}")
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
            name="[Setup] Login Entrenador"
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
    # ENTRENAMIENTOS
    # ==========================================
    
    @task(3)
    def task_list_entrenamientos(self):
        """Listar entrenamientos"""
        if not self.token:
            self._do_login()
            return
        
        self.client.get(
            f"{ENTRENADOR_PREFIX}/entrenamientos/",
            headers=self._headers(),
            name="Entrenador - List Entrenamientos"
        )
    
    @task(2)
    def task_create_entrenamiento(self):
        """Crear entrenamiento"""
        if not self.token:
            return
        
        entrenamiento_data = {
            "tipo_entrenamiento": random.choice(["VELOCIDAD", "RESISTENCIA", "FUERZA", "TECNICA"]),
            "descripcion": f"Descripción del entrenamiento de prueba {random_string(5)}",
            "fecha_entrenamiento": random_date_future(7)
        }
        
        with self.client.post(
            f"{ENTRENADOR_PREFIX}/entrenamientos/",
            json=entrenamiento_data,
            headers=self._headers(),
            catch_response=True,
            name="Entrenador - Create Entrenamiento"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    ent_id = data.get("id") or data.get("data", {}).get("id")
                    if ent_id:
                        self.entrenamiento_ids.append(ent_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    @task(2)
    def task_get_entrenamiento(self):
        """Obtener entrenamiento por ID"""
        if not self.token or not self.entrenamiento_ids:
            return
        
        ent_id = random.choice(self.entrenamiento_ids)
        
        self.client.get(
            f"{ENTRENADOR_PREFIX}/entrenamientos/{ent_id}",
            headers=self._headers(),
            name="Entrenador - Get Entrenamiento"
        )
    
    # ==========================================
    # HORARIOS
    # ==========================================
    
    @task(2)
    def task_list_horarios(self):
        """Listar horarios de un entrenamiento"""
        if not self.token or not self.entrenamiento_ids:
            return
        
        ent_id = random.choice(self.entrenamiento_ids)
        
        self.client.get(
            f"{ENTRENADOR_PREFIX}/horarios/entrenamiento/{ent_id}",
            headers=self._headers(),
            name="Entrenador - List Horarios"
        )
    
    @task(1)
    def task_create_horario(self):
        """Crear horario para un entrenamiento"""
        if not self.token or not self.entrenamiento_ids:
            return
        
        ent_id = random.choice(self.entrenamiento_ids)
        
        # Schema: name (str), hora_inicio (time), hora_fin (time)
        hora_inicio = f"{random.randint(6, 12):02d}:{random.choice(['00', '30'])}:00"
        hora_fin = f"{random.randint(13, 20):02d}:{random.choice(['00', '30'])}:00"
        
        horario_data = {
            "name": f"Horario {random.choice(['Mañana', 'Tarde', 'Noche'])} {random_string(3)}",
            "hora_inicio": hora_inicio,
            "hora_fin": hora_fin
        }
        
        with self.client.post(
            f"{ENTRENADOR_PREFIX}/horarios/entrenamiento/{ent_id}",
            json=horario_data,
            headers=self._headers(),
            catch_response=True,
            name="Entrenador - Create Horario"
        ) as response:
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    h_id = data.get("id") or data.get("data", {}).get("id")
                    if h_id:
                        self.horario_ids.append(h_id)
                    response.success()
                except:
                    response.failure("Parse error")
            else:
                response.failure(f"Status {response.status_code}")
    
    # ==========================================
    # ASISTENCIAS
    # ==========================================
    
    @task(2)
    def task_get_mis_registros(self):
        """Obtener mis registros de asistencia - requiere atleta_id"""
        if not self.token:
            return
        
        # El endpoint requiere atleta_id como query param
        # Usamos un ID ficticio ya que es solo para stress test
        self.client.get(
            f"{ENTRENADOR_PREFIX}/asistencias/mis-registros?atleta_id=1",
            headers=self._headers(),
            name="Entrenador - Mis Registros"
        )
    
    @task(1)
    def task_get_inscripciones_horario(self):
        """Obtener inscripciones de un horario"""
        if not self.token or not self.horario_ids:
            return
        
        h_id = random.choice(self.horario_ids)
        
        self.client.get(
            f"{ENTRENADOR_PREFIX}/asistencias/inscripcion/horario/{h_id}",
            headers=self._headers(),
            name="Entrenador - Inscripciones Horario"
        )


class EntrenadorReadOnlyUser(HttpUser):
    """
    Usuario que solo consulta entrenamientos (modo lectura)
    Este usuario se registra como ENTRENADOR para tener acceso legítimo
    """
    wait_time = between(2, 5)
    weight = 1
    
    def on_start(self):
        """Setup: registrar y login como ENTRENADOR"""
        self.token = None
        self.username = f"ent_reader_{random_string()}"
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
            "roles": ["ENTRENADOR"],  # Cambio: usar rol ENTRENADOR
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
    def task_list_entrenamientos(self):
        """Listar entrenamientos"""
        self.client.get(
            f"{ENTRENADOR_PREFIX}/entrenamientos/",
            headers=self._headers(),
            name="Entrenador - List (Read Only)"
        )
    
    @task(1)
    def task_get_entrenamiento_random(self):
        """Obtener entrenamiento aleatorio"""
        ent_id = random.randint(1, 10)
        
        self.client.get(
            f"{ENTRENADOR_PREFIX}/entrenamientos/{ent_id}",
            headers=self._headers(),
            name="Entrenador - Get Random ID"
        )
