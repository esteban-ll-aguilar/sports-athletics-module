#!/usr/bin/env python3
"""
Orquestador Principal de Pruebas de Estrés

Este script ejecuta todas las pruebas de estrés de forma automática:
1. Verifica que los servicios estén levantados
2. Puebla la base de datos con datos de prueba
3. Ejecuta pruebas con Locust, JMeter y/o Gatling
4. Monitorea métricas en tiempo real
5. Analiza resultados y compara con baselines
6. Genera reportes consolidados

Uso:
    python run_all_tests.py
    python run_all_tests.py --smoke
    python run_all_tests.py --load
    python run_all_tests.py --stress
    python run_all_tests.py --tool locust
    python run_all_tests.py --skip-populate
"""

import argparse
import asyncio
import subprocess
import sys
import time
import os
from datetime import datetime
from typing import Dict, List, Optional
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


class TestOrchestrator:
    """Orquestador de pruebas de estrés."""
    
    def __init__(self, api_url: str = "http://localhost:8080"):
        self.api_url = api_url
        self.results = {}
        self.start_time = datetime.now()
    
    def check_service_health(self, service: str, url: str, max_attempts: int = 10) -> bool:
        """Verifica que un servicio esté disponible."""
        print_info(f"Verificando {service} en {url}...")
        
        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print_success(f"{service} está disponible")
                    return True
            except Exception as e:
                if attempt < max_attempts:
                    print_warning(f"Intento {attempt}/{max_attempts} fallido, reintentando...")
                    time.sleep(3)
                else:
                    print_error(f"No se pudo conectar a {service}: {str(e)}")
        
        return False
    
    def check_all_services(self) -> bool:
        """Verifica que todos los servicios necesarios estén levantados."""
        print_header("VERIFICANDO SERVICIOS")
        
        services = {
            "FastAPI Backend": f"{self.api_url}/health",
            "Prometheus Metrics": f"{self.api_url}/metrics",
            "Prometheus": "http://localhost:9090/-/healthy",
            "Grafana": "http://localhost:3000/api/health",
        }
        
        all_healthy = True
        for service, url in services.items():
            if not self.check_service_health(service, url):
                all_healthy = False
        
        if all_healthy:
            print_success("\n✅ Todos los servicios están disponibles")
        else:
            print_error("\n❌ Algunos servicios no están disponibles")
            print_info("Ejecuta: docker-compose -f docker-compose-stress.yml up -d")
        
        return all_healthy
    
    def populate_database(self, mode: str = "basic") -> bool:
        """Puebla la base de datos con datos de prueba."""
        print_header("POBLANDO BASE DE DATOS")
        
        cmd = ["python", "populate_database.py"]
        
        if mode == "full":
            cmd.append("--full")
        elif mode == "smoke":
            cmd.extend(["--atletas", "25", "--entrenadores", "5", "--entrenamientos", "15"])
        
        cmd.append("--generate-csv")
        
        print_info(f"Ejecutando: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print_success("Base de datos poblada exitosamente")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Error poblando base de datos: {e}")
            if e.stdout:
                print(e.stdout)
            if e.stderr:
                print(e.stderr)
            return False
    
    def run_locust_test(self, users: int, spawn_rate: int, duration: str) -> bool:
        """Ejecuta prueba con Locust."""
        print_header(f"EJECUTANDO LOCUST TEST ({users} usuarios)")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        html_report = f"locust/results/report_{timestamp}.html"
        csv_prefix = f"locust/results/stats_{timestamp}"
        
        cmd = [
            "locust",
            "-f", "locust/locustfile.py",
            "--host", self.api_url,
            "--users", str(users),
            "--spawn-rate", str(spawn_rate),
            "--run-time", duration,
            "--headless",
            "--html", html_report,
            "--csv", csv_prefix,
            "--loglevel", "INFO"
        ]
        
        print_info(f"Comando: {' '.join(cmd)}")
        print_info(f"Duración: {duration}")
        print_info(f"Usuarios: {users}")
        print_info(f"Spawn rate: {spawn_rate}/s")
        print_info("\n🏃 Ejecutando prueba...\n")
        
        try:
            result = subprocess.run(cmd, check=True)
            print_success(f"\n✅ Locust test completado")
            print_info(f"Reporte HTML: {html_report}")
            print_info(f"Estadísticas CSV: {csv_prefix}_stats.csv")
            
            self.results["locust"] = {
                "status": "success",
                "report": html_report,
                "csv": f"{csv_prefix}_stats.csv"
            }
            return True
            
        except subprocess.CalledProcessError as e:
            print_error(f"Error ejecutando Locust: {e}")
            self.results["locust"] = {"status": "failed", "error": str(e)}
            return False
    
    def run_jmeter_test(self, users: int, ramp_time: int) -> bool:
        """Ejecuta prueba con JMeter."""
        print_header(f"EJECUTANDO JMETER TEST ({users} usuarios)")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        jtl_file = f"jmeter/results/results_{timestamp}.jtl"
        report_dir = f"jmeter/results/report_{timestamp}"
        
        # Verificar que Docker esté corriendo JMeter
        check_cmd = ["docker", "ps", "--filter", "name=jmeter-stress-test", "--format", "{{.Names}}"]
        try:
            result = subprocess.run(check_cmd, capture_output=True, text=True)
            if "jmeter-stress-test" not in result.stdout:
                print_error("Contenedor JMeter no está corriendo")
                print_info("Ejecuta: docker-compose -f docker-compose-stress.yml up -d")
                return False
        except Exception as e:
            print_error(f"Error verificando Docker: {e}")
            return False
        
        cmd = [
            "docker", "exec", "jmeter-stress-test",
            "jmeter", "-n",
            "-t", "/tests/load_test.jmx",
            "-l", f"/results/results_{timestamp}.jtl",
            "-e", "-o", f"/results/report_{timestamp}",
            "-JNUM_USERS", str(users),
            "-JRAMP_TIME", str(ramp_time),
            "-JBASE_URL", self.api_url
        ]
        
        print_info(f"Ejecutando JMeter con {users} usuarios...")
        print_info("\n🏃 Ejecutando prueba...\n")
        
        try:
            result = subprocess.run(cmd, check=True)
            print_success(f"\n✅ JMeter test completado")
            print_info(f"Resultados JTL: jmeter/results/results_{timestamp}.jtl")
            print_info(f"Reporte HTML: jmeter/results/report_{timestamp}/index.html")
            
            self.results["jmeter"] = {
                "status": "success",
                "jtl": jtl_file,
                "report": f"{report_dir}/index.html"
            }
            return True
            
        except subprocess.CalledProcessError as e:
            print_error(f"Error ejecutando JMeter: {e}")
            self.results["jmeter"] = {"status": "failed", "error": str(e)}
            return False
    
    def run_gatling_test(self, simulation: str = "LoadTestSimulation") -> bool:
        """Ejecuta prueba con Gatling."""
        print_header(f"EJECUTANDO GATLING TEST ({simulation})")
        
        # Verificar que Docker esté corriendo Gatling
        check_cmd = ["docker", "ps", "--filter", "name=gatling-stress-test", "--format", "{{.Names}}"]
        try:
            result = subprocess.run(check_cmd, capture_output=True, text=True)
            if "gatling-stress-test" not in result.stdout:
                print_error("Contenedor Gatling no está corriendo")
                print_info("Ejecuta: docker-compose -f docker-compose-stress.yml up -d")
                return False
        except Exception as e:
            print_error(f"Error verificando Docker: {e}")
            return False
        
        cmd = [
            "docker", "exec", "gatling-stress-test",
            "gatling.sh",
            "-sf", "/opt/gatling/user-files/simulations",
            "-s", simulation
        ]
        
        print_info(f"Ejecutando Gatling simulation: {simulation}")
        print_info("\n🏃 Ejecutando prueba...\n")
        
        try:
            result = subprocess.run(cmd, check=True)
            print_success(f"\n✅ Gatling test completado")
            print_info(f"Reportes en: gatling/results/")
            
            self.results["gatling"] = {
                "status": "success",
                "simulation": simulation
            }
            return True
            
        except subprocess.CalledProcessError as e:
            print_error(f"Error ejecutando Gatling: {e}")
            self.results["gatling"] = {"status": "failed", "error": str(e)}
            return False
    
    def analyze_results(self) -> bool:
        """Analiza los resultados de las pruebas."""
        print_header("ANALIZANDO RESULTADOS")
        
        cmd = [
            "python", "analyze_results.py",
            "--tool", "all",
            "--compare-baseline",
            "--generate-plots"
        ]
        
        print_info("Analizando resultados y comparando con baselines...")
        
        try:
            result = subprocess.run(cmd, check=True)
            print_success("Análisis completado")
            return True
        except subprocess.CalledProcessError as e:
            print_error(f"Error analizando resultados: {e}")
            return False
    
    def generate_final_report(self):
        """Genera reporte final consolidado."""
        print_header("REPORTE FINAL")
        
        duration = datetime.now() - self.start_time
        
        print(f"{Colors.BOLD}Duración total: {duration}{Colors.ENDC}")
        print(f"\n{Colors.BOLD}Resultados por herramienta:{Colors.ENDC}")
        
        for tool, result in self.results.items():
            status = result.get("status", "unknown")
            symbol = "✅" if status == "success" else "❌"
            print(f"  {symbol} {tool.upper()}: {status}")
            
            if status == "success":
                if "report" in result:
                    print(f"      📊 Reporte: {result['report']}")
                if "csv" in result:
                    print(f"      📄 CSV: {result['csv']}")
        
        print(f"\n{Colors.BOLD}Archivos generados:{Colors.ENDC}")
        print(f"  📁 locust/results/")
        print(f"  📁 jmeter/results/")
        print(f"  📁 results/")
        
        print(f"\n{Colors.BOLD}Próximos pasos:{Colors.ENDC}")
        print(f"  1. Revisar reportes HTML generados")
        print(f"  2. Abrir Grafana: http://localhost:3000")
        print(f"  3. Ver métricas en Prometheus: http://localhost:9090")
        print(f"  4. Analizar gráficos en results/plots/")


def main():
    parser = argparse.ArgumentParser(description="Orquestador de pruebas de estrés")
    
    # Tipos de prueba
    test_types = parser.add_mutually_exclusive_group()
    test_types.add_argument("--smoke", action="store_true",
                           help="Smoke test (25 usuarios, 2 minutos)")
    test_types.add_argument("--load", action="store_true",
                           help="Load test (100 usuarios, 10 minutos)")
    test_types.add_argument("--stress", action="store_true",
                           help="Stress test (500 usuarios, 15 minutos)")
    
    # Herramientas
    parser.add_argument("--tool", choices=["locust", "jmeter", "gatling", "all"], default="locust",
                       help="Herramienta a usar (default: locust)")
    
    # Parámetros personalizados
    parser.add_argument("--users", type=int, help="Número de usuarios")
    parser.add_argument("--duration", help="Duración (ej: 5m, 10m)")
    parser.add_argument("--api-url", default="http://localhost:8080", help="URL del API")
    
    # Flags
    parser.add_argument("--skip-check", action="store_true", help="Saltar verificación de servicios")
    parser.add_argument("--skip-populate", action="store_true", help="Saltar población de BD")
    parser.add_argument("--skip-analyze", action="store_true", help="Saltar análisis de resultados")
    
    args = parser.parse_args()
    
    # Determinar parámetros de prueba
    if args.smoke:
        users = 25
        duration = "2m"
        spawn_rate = 5
        populate_mode = "smoke"
    elif args.load:
        users = 100
        duration = "10m"
        spawn_rate = 10
        populate_mode = "basic"
    elif args.stress:
        users = 500
        duration = "15m"
        spawn_rate = 25
        populate_mode = "full"
    else:
        users = args.users or 50
        duration = args.duration or "5m"
        spawn_rate = 10
        populate_mode = "basic"
    
    print_header("🚀 ORQUESTADOR DE PRUEBAS DE ESTRÉS")
    print_info(f"Configuración:")
    print_info(f"  - Herramienta: {args.tool}")
    print_info(f"  - Usuarios: {users}")
    print_info(f"  - Duración: {duration}")
    print_info(f"  - API URL: {args.api_url}")
    
    orchestrator = TestOrchestrator(api_url=args.api_url)
    
    total_steps = 5
    current_step = 0
    
    # Paso 1: Verificar servicios
    current_step += 1
    if not args.skip_check:
        print_step(current_step, total_steps, "Verificando servicios")
        if not orchestrator.check_all_services():
            print_error("Los servicios no están disponibles. Abortando.")
            sys.exit(1)
    else:
        print_info("Saltando verificación de servicios")
    
    # Paso 2: Poblar base de datos
    current_step += 1
    if not args.skip_populate:
        print_step(current_step, total_steps, "Poblando base de datos")
        if not orchestrator.populate_database(mode=populate_mode):
            print_warning("Error poblando BD, continuando de todas formas...")
    else:
        print_info("Saltando población de base de datos")
    
    # Paso 3: Ejecutar pruebas
    current_step += 1
    print_step(current_step, total_steps, "Ejecutando pruebas")
    
    test_success = False
    
    if args.tool in ["locust", "all"]:
        test_success = orchestrator.run_locust_test(users, spawn_rate, duration) or test_success
    
    if args.tool in ["jmeter", "all"]:
        test_success = orchestrator.run_jmeter_test(users, ramp_time=30) or test_success
    
    if args.tool in ["gatling", "all"]:
        test_success = orchestrator.run_gatling_test() or test_success
    
    if not test_success:
        print_error("Todas las pruebas fallaron")
        sys.exit(1)
    
    # Paso 4: Analizar resultados
    current_step += 1
    if not args.skip_analyze:
        print_step(current_step, total_steps, "Analizando resultados")
        orchestrator.analyze_results()
    else:
        print_info("Saltando análisis de resultados")
    
    # Paso 5: Reporte final
    current_step += 1
    print_step(current_step, total_steps, "Generando reporte final")
    orchestrator.generate_final_report()
    
    print_success("\n🎉 PROCESO COMPLETADO EXITOSAMENTE")
    
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print_warning("\n\n⚠️  Proceso interrumpido por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n❌ Error inesperado: {str(e)}")
        sys.exit(1)
