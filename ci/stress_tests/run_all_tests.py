#!/usr/bin/env python3
"""
Orquestador de Pruebas de Estrés con Locust

Este script automatiza:
1. Verifica que el API esté disponible
2. Verifica que las rutas de test estén habilitadas
3. Puebla la base de datos con datos de prueba
4. Ejecuta pruebas con Locust

Uso:
    python run_all_tests.py                    # Smoke test (10 users, 2 min)
    python run_all_tests.py --load             # Load test (100 users, 10 min)
    python run_all_tests.py --stress           # Stress test (500 users, 15 min)
    python run_all_tests.py --spike            # Spike test (300 users, 5 min)
    python run_all_tests.py --soak             # Soak test (150 users, 60 min)
    python run_all_tests.py --skip-populate    # Saltar poblado de BD
    python run_all_tests.py --users 200        # Custom: 200 usuarios
"""

import argparse
import subprocess
import sys
import time
import os
from datetime import datetime
import requests

# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(msg: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{msg.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")


def print_success(msg: str):
    print(f"{Colors.OKGREEN}✅ {msg}{Colors.ENDC}")


def print_warning(msg: str):
    print(f"{Colors.WARNING}⚠️  {msg}{Colors.ENDC}")


def print_error(msg: str):
    print(f"{Colors.FAIL}❌ {msg}{Colors.ENDC}")


def print_info(msg: str):
    print(f"{Colors.OKBLUE}ℹ️  {msg}{Colors.ENDC}")


def print_step(step: int, total: int, msg: str):
    print(f"{Colors.BOLD}[{step}/{total}] {msg}{Colors.ENDC}")


# Configuraciones de test predefinidas
TEST_CONFIGS = {
    "smoke": {
        "users": 10,
        "spawn_rate": 2,
        "duration": "2m",
        "description": "Smoke Test - Verificación básica"
    },
    "load": {
        "users": 100,
        "spawn_rate": 10,
        "duration": "10m",
        "description": "Load Test - Carga normal"
    },
    "stress": {
        "users": 500,
        "spawn_rate": 25,
        "duration": "15m",
        "description": "Stress Test - Carga alta"
    },
    "spike": {
        "users": 300,
        "spawn_rate": 100,
        "duration": "5m",
        "description": "Spike Test - Picos de carga"
    },
    "soak": {
        "users": 150,
        "spawn_rate": 15,
        "duration": "60m",
        "description": "Soak Test - Resistencia prolongada"
    }
}


class LocustOrchestrator:
    """Orquestador de pruebas de estrés con Locust."""
    
    def __init__(self, api_url: str = "http://localhost:8080"):
        self.api_url = api_url
        self.start_time = datetime.now()
        self.results_dir = os.path.join(os.path.dirname(__file__), "results")
    
    def check_api_health(self, max_attempts: int = 10) -> bool:
        """Verifica que el API esté disponible."""
        print_info(f"Verificando API en {self.api_url}...")
        
        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.get(f"{self.api_url}/health", timeout=5)
                if response.status_code == 200:
                    print_success("API disponible")
                    return True
            except Exception as e:
                if attempt < max_attempts:
                    print_warning(f"Intento {attempt}/{max_attempts} fallido, reintentando...")
                    time.sleep(3)
                else:
                    print_error(f"No se pudo conectar al API: {str(e)}")
        
        return False
    
    def check_test_routes(self) -> bool:
        """Verifica que las rutas de test estén habilitadas."""
        print_info("Verificando rutas de test...")
        
        try:
            response = requests.post(
                f"{self.api_url}/api/v1/tests/auth/login",
                json={"username": "test@test.com", "password": "test"},
                timeout=5
            )
            
            if response.status_code == 404:
                print_error("Las rutas de test NO están habilitadas")
                print_error("Configura ENABLE_TEST_ROUTES=true en el backend")
                return False
            
            print_success("Rutas de test habilitadas")
            return True
            
        except Exception as e:
            print_error(f"Error verificando rutas de test: {str(e)}")
            return False
    
    def populate_database(self, users: int = 100, competencias: int = 30) -> bool:
        """Puebla la base de datos con datos de prueba."""
        print_header("POBLANDO BASE DE DATOS")
        
        cmd = [
            sys.executable,  # python
            "populate_database.py",
            "--users", str(users),
            "--competencias", str(competencias),
            "--generate-csv",
            "--api-url", self.api_url
        ]
        
        print_info(f"Ejecutando: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(cmd, check=True, cwd=os.path.dirname(__file__))
            print_success("Base de datos poblada exitosamente")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Error poblando base de datos: {e}")
            return False
    
    def run_locust_test(
        self,
        users: int,
        spawn_rate: int,
        duration: str,
        headless: bool = True
    ) -> bool:
        """Ejecuta prueba con Locust."""
        print_header(f"EJECUTANDO LOCUST TEST ({users} usuarios)")
        
        # Crear directorio de resultados
        os.makedirs(self.results_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_html = os.path.join(self.results_dir, f"report_{timestamp}.html")
        report_csv = os.path.join(self.results_dir, f"stats_{timestamp}")
        
        locust_file = os.path.join(os.path.dirname(__file__), "locust", "locustfile.py")
        
        cmd = [
            "locust",
            "-f", locust_file,
            "--host", self.api_url,
            "--users", str(users),
            "--spawn-rate", str(spawn_rate),
            "--run-time", duration,
            "--html", report_html,
            "--csv", report_csv
        ]
        
        if headless:
            cmd.append("--headless")
        
        print_info(f"Ejecutando: {' '.join(cmd)}")
        print_info(f"Usuarios: {users}")
        print_info(f"Spawn rate: {spawn_rate}/s")
        print_info(f"Duración: {duration}")
        print_info(f"Reporte HTML: {report_html}")
        
        try:
            result = subprocess.run(cmd, cwd=os.path.dirname(__file__))
            
            if result.returncode == 0:
                print_success("Test completado exitosamente")
                print_success(f"Reporte generado: {report_html}")
                return True
            else:
                print_error(f"Test terminó con código: {result.returncode}")
                return False
                
        except FileNotFoundError:
            print_error("Locust no está instalado. Instálalo con: pip install locust")
            return False
        except Exception as e:
            print_error(f"Error ejecutando Locust: {e}")
            return False
    
    def run_locust_ui(self) -> bool:
        """Inicia Locust con Web UI para pruebas interactivas."""
        print_header("INICIANDO LOCUST WEB UI")
        
        locust_file = os.path.join(os.path.dirname(__file__), "locust", "locustfile.py")
        
        cmd = [
            "locust",
            "-f", locust_file,
            "--host", self.api_url,
            "--web-host", "0.0.0.0",
            "--web-port", "8089"
        ]
        
        print_info(f"Ejecutando: {' '.join(cmd)}")
        print_info("Web UI disponible en: http://localhost:8089")
        print_info("Presiona Ctrl+C para detener")
        
        try:
            subprocess.run(cmd, cwd=os.path.dirname(__file__))
            return True
        except KeyboardInterrupt:
            print_info("\nLocust detenido por el usuario")
            return True
        except FileNotFoundError:
            print_error("Locust no está instalado. Instálalo con: pip install locust")
            return False
    
    def print_summary(self, test_type: str, success: bool):
        """Imprime resumen del test."""
        print_header("RESUMEN DEL TEST")
        
        duration = datetime.now() - self.start_time
        
        print(f"  Tipo de test: {test_type}")
        print(f"  API URL: {self.api_url}")
        print(f"  Duración total: {duration}")
        print(f"  Resultado: {'✅ EXITOSO' if success else '❌ FALLIDO'}")
        print(f"  Reportes en: {self.results_dir}")


def main():
    parser = argparse.ArgumentParser(
        description="Orquestador de Pruebas de Estrés con Locust",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python run_all_tests.py                    # Smoke test (default)
  python run_all_tests.py --load             # Load test
  python run_all_tests.py --stress           # Stress test
  python run_all_tests.py --ui               # Abrir Web UI interactiva
  python run_all_tests.py --skip-populate    # Saltar poblado de BD
        """
    )
    
    # Tipo de test
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument("--smoke", action="store_true", help="Smoke test (10 users, 2 min)")
    test_group.add_argument("--load", action="store_true", help="Load test (100 users, 10 min)")
    test_group.add_argument("--stress", action="store_true", help="Stress test (500 users, 15 min)")
    test_group.add_argument("--spike", action="store_true", help="Spike test (300 users, 5 min)")
    test_group.add_argument("--soak", action="store_true", help="Soak test (150 users, 60 min)")
    test_group.add_argument("--ui", action="store_true", help="Iniciar Web UI interactiva")
    
    # Configuración custom
    parser.add_argument("--users", type=int, help="Número de usuarios (override)")
    parser.add_argument("--spawn-rate", type=int, help="Spawn rate (override)")
    parser.add_argument("--duration", type=str, help="Duración del test, ej: 5m, 1h (override)")
    
    # Opciones
    parser.add_argument("--skip-populate", action="store_true", help="Saltar poblado de BD")
    parser.add_argument("--api-url", type=str, default="http://localhost:8080", help="URL del API")
    parser.add_argument("--populate-users", type=int, default=100, help="Usuarios a crear en BD")
    parser.add_argument("--populate-competencias", type=int, default=30, help="Competencias a crear")
    
    args = parser.parse_args()
    
    # Determinar tipo de test
    if args.load:
        test_type = "load"
    elif args.stress:
        test_type = "stress"
    elif args.spike:
        test_type = "spike"
    elif args.soak:
        test_type = "soak"
    elif args.ui:
        test_type = "ui"
    else:
        test_type = "smoke"
    
    print_header("ORQUESTADOR DE PRUEBAS DE ESTRÉS - LOCUST")
    print_info(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info(f"API URL: {args.api_url}")
    
    if test_type != "ui":
        config = TEST_CONFIGS[test_type]
        print_info(f"Test: {config['description']}")
    
    orchestrator = LocustOrchestrator(args.api_url)
    
    # Paso 1: Verificar API
    print_step(1, 4, "Verificando disponibilidad del API")
    if not orchestrator.check_api_health():
        print_error("El API no está disponible. Asegúrate de que el servidor esté corriendo.")
        sys.exit(1)
    
    # Paso 2: Verificar rutas de test
    print_step(2, 4, "Verificando rutas de test")
    if not orchestrator.check_test_routes():
        print_error("Las rutas de test no están habilitadas.")
        sys.exit(1)
    
    # Paso 3: Poblar base de datos
    if not args.skip_populate:
        print_step(3, 4, "Poblando base de datos")
        if not orchestrator.populate_database(args.populate_users, args.populate_competencias):
            print_warning("Error poblando BD, continuando de todas formas...")
    else:
        print_step(3, 4, "Saltando poblado de BD (--skip-populate)")
    
    # Paso 4: Ejecutar test
    print_step(4, 4, "Ejecutando prueba de estrés")
    
    if test_type == "ui":
        success = orchestrator.run_locust_ui()
    else:
        config = TEST_CONFIGS[test_type]
        
        # Aplicar overrides si se especificaron
        users = args.users or config["users"]
        spawn_rate = args.spawn_rate or config["spawn_rate"]
        duration = args.duration or config["duration"]
        
        success = orchestrator.run_locust_test(
            users=users,
            spawn_rate=spawn_rate,
            duration=duration,
            headless=True
        )
    
    # Resumen
    orchestrator.print_summary(test_type, success)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
