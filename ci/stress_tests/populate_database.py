#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos de prueba para stress testing.
Usa los endpoints de TEST: /api/v1/tests/* (sin rate limiting)

Uso:
    python populate_database.py                     # Crea datos básicos
    python populate_database.py --full              # Crea datos completos
    python populate_database.py --users 100         # Crea 100 usuarios
    python populate_database.py --competencias 50   # Crea 50 competencias

IMPORTANTE: Requiere ENABLE_TEST_ROUTES=true en el backend
"""

import sys
import os
import argparse
import asyncio
from typing import List, Dict, Optional
import httpx

# Agregar path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.utils import (
    generar_atleta,
    generar_entrenador,
    generar_entrenamiento,
    generar_competencia,
    generar_cedula_ecuador,
    generar_nombre_completo,
    generar_email,
    generar_telefono_ecuador,
)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
API_PREFIX = "/api/v1/tests"
API_TIMEOUT = 30.0

# Colores para output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_info(message: str):
    print(f"{Colors.OKBLUE}ℹ️  {message}{Colors.ENDC}")


def print_success(message: str):
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")


def print_error(message: str):
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")


def print_warning(message: str):
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")


def print_header(message: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


class DatabasePopulator:
    """Clase para poblar la base de datos usando endpoints de TEST."""
    
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.client: Optional[httpx.AsyncClient] = None
        self.auth_token: Optional[str] = None
        self.stats = {
            "usuarios": {"created": 0, "failed": 0},
            "competencias": {"created": 0, "failed": 0},
        }
    
    async def __aenter__(self):
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=API_TIMEOUT,
            follow_redirects=True
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()
    
    async def check_health(self) -> bool:
        """Verifica que el API esté disponible."""
        print_info("Verificando disponibilidad del API...")
        
        try:
            response = await self.client.get("/health")
            if response.status_code == 200:
                print_success("API disponible")
                return True
            else:
                print_error(f"API no disponible: {response.status_code}")
                return False
        except Exception as e:
            print_error(f"Error conectando al API: {str(e)}")
            return False
    
    async def check_test_routes(self) -> bool:
        """Verifica que las rutas de test estén habilitadas."""
        print_info("Verificando rutas de test...")
        
        try:
            # Intentar hacer login en el endpoint de test
            response = await self.client.post(
                f"{API_PREFIX}/auth/login",
                json={"username": "test@test.com", "password": "test"}
            )
            
            # Si devuelve 404, las rutas de test no están habilitadas
            if response.status_code == 404:
                print_error("Las rutas de test NO están habilitadas")
                print_error("Asegúrate de tener ENABLE_TEST_ROUTES=true en el backend")
                return False
            
            # 401 o 409 significa que las rutas están habilitadas
            print_success("Rutas de test habilitadas")
            return True
            
        except Exception as e:
            print_error(f"Error verificando rutas de test: {str(e)}")
            return False
    
    async def register_user(
        self,
        email: str,
        password: str,
        username: str,
        first_name: str,
        last_name: str,
        role: str = "ATLETA"
    ) -> Optional[Dict]:
        """
        Registra un usuario usando el endpoint de test.
        Permite crear usuarios con cualquier rol incluyendo ADMINISTRADOR.
        """
        user_data = {
            "email": email,
            "password": password,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
            "tipo_identificacion": "CEDULA",
            "identificacion": generar_cedula_ecuador(),
            "tipo_estamento": "ESTUDIANTE",
            "direccion": "Dirección de prueba",
            "phone": generar_telefono_ecuador(),
            "roles": [role],
            "is_active": True
        }
        
        try:
            response = await self.client.post(
                f"{API_PREFIX}/auth/register",
                json=user_data
            )
            
            if response.status_code in [200, 201]:
                self.stats["usuarios"]["created"] += 1
                return response.json()
            elif response.status_code == 409:
                # Usuario ya existe, no es error
                return {"exists": True}
            else:
                self.stats["usuarios"]["failed"] += 1
                return None
                
        except Exception as e:
            self.stats["usuarios"]["failed"] += 1
            print_error(f"Error registrando usuario {email}: {str(e)}")
            return None
    
    async def authenticate_as_admin(self) -> bool:
        """Autentica como admin y guarda el token."""
        print_info("Autenticando como administrador...")
        
        try:
            response = await self.client.post(
                f"{API_PREFIX}/auth/login",
                json={
                    "username": "admin@test.com",
                    "password": "Admin123!"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = (
                    data.get("access_token") or
                    data.get("data", {}).get("access_token")
                )
                
                if self.auth_token:
                    self.client.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    print_success("Autenticación exitosa")
                    return True
            
            print_error(f"Autenticación fallida: {response.status_code}")
            return False
            
        except Exception as e:
            print_error(f"Error en autenticación: {str(e)}")
            return False
    
    async def create_competencia(self, data: Optional[Dict] = None) -> Optional[Dict]:
        """Crea una competencia usando el endpoint de test."""
        if data is None:
            data = generar_competencia()
        
        try:
            response = await self.client.post(
                f"{API_PREFIX}/competencia/competencias/",
                json=data
            )
            
            if response.status_code in [200, 201]:
                self.stats["competencias"]["created"] += 1
                return response.json()
            else:
                self.stats["competencias"]["failed"] += 1
                return None
                
        except Exception as e:
            self.stats["competencias"]["failed"] += 1
            return None
    
    async def create_test_users(self, cantidad: int = 100):
        """Crea usuarios de prueba para Locust."""
        print_header(f"CREANDO {cantidad} USUARIOS DE PRUEBA")
        
        # 1. Crear usuario administrador
        print_info("Creando usuario administrador...")
        await self.register_user(
            email="admin@test.com",
            password="Admin123!",
            username="admin_test",
            first_name="Admin",
            last_name="Test",
            role="ADMINISTRADOR"
        )
        
        # 2. Crear entrenadores
        print_info("Creando entrenadores...")
        for i in range(1, 3):
            await self.register_user(
                email=f"entrenador{i}@test.com",
                password="Entrenador123!",
                username=f"entrenador{i}",
                first_name=f"Entrenador{i}",
                last_name="Test",
                role="ENTRENADOR"
            )
        
        # 3. Crear representantes
        print_info("Creando representantes...")
        for i in range(1, 3):
            await self.register_user(
                email=f"representante{i}@test.com",
                password="Rep123!",
                username=f"representante{i}",
                first_name=f"Representante{i}",
                last_name="Test",
                role="REPRESENTANTE"
            )
        
        # 4. Crear usuarios genéricos (atletas)
        print_info(f"Creando {cantidad} usuarios atletas...")
        for i in range(1, cantidad + 1):
            nombre = generar_nombre_completo()
            await self.register_user(
                email=f"user{i}@test.com",
                password="Password123!",
                username=f"user{i}",
                first_name=nombre["nombre"],
                last_name=nombre["apellido_paterno"],
                role="ATLETA"
            )
            
            if i % 25 == 0:
                print_info(f"Progreso: {i}/{cantidad} usuarios creados")
        
        print_success(f"Usuarios creados: {self.stats['usuarios']['created']}")
        if self.stats['usuarios']['failed'] > 0:
            print_warning(f"Usuarios fallidos: {self.stats['usuarios']['failed']}")
    
    async def create_competencias(self, cantidad: int = 30):
        """Crea competencias de prueba."""
        print_header(f"CREANDO {cantidad} COMPETENCIAS")
        
        # Primero autenticar como admin
        if not await self.authenticate_as_admin():
            print_error("No se pudo autenticar como admin. Creando admin primero...")
            await self.register_user(
                email="admin@test.com",
                password="Admin123!",
                username="admin_test",
                first_name="Admin",
                last_name="Test",
                role="ADMINISTRADOR"
            )
            if not await self.authenticate_as_admin():
                print_error("No se pudo autenticar. Abortando creación de competencias.")
                return
        
        for i in range(cantidad):
            await self.create_competencia()
            
            if (i + 1) % 10 == 0:
                print_info(f"Progreso: {i + 1}/{cantidad} competencias creadas")
        
        print_success(f"Competencias creadas: {self.stats['competencias']['created']}")
        if self.stats['competencias']['failed'] > 0:
            print_warning(f"Competencias fallidas: {self.stats['competencias']['failed']}")
    
    async def generate_csv(self, cantidad: int = 100, archivo: str = "users.csv"):
        """Genera archivo CSV con usuarios para referencia."""
        print_info(f"Generando archivo {archivo}...")
        
        import csv
        
        with open(archivo, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['email', 'password', 'role'])
            
            # Admin
            writer.writerow(['admin@test.com', 'Admin123!', 'ADMINISTRADOR'])
            
            # Entrenadores
            for i in range(1, 3):
                writer.writerow([f'entrenador{i}@test.com', 'Entrenador123!', 'ENTRENADOR'])
            
            # Representantes
            for i in range(1, 3):
                writer.writerow([f'representante{i}@test.com', 'Rep123!', 'REPRESENTANTE'])
            
            # Usuarios genéricos
            for i in range(1, cantidad + 1):
                writer.writerow([f'user{i}@test.com', 'Password123!', 'ATLETA'])
        
        print_success(f"Archivo {archivo} generado con {cantidad + 6} usuarios")
    
    def print_summary(self):
        """Imprime resumen de operaciones."""
        print_header("RESUMEN")
        
        total_created = sum(s["created"] for s in self.stats.values())
        total_failed = sum(s["failed"] for s in self.stats.values())
        
        for entity, stats in self.stats.items():
            if stats["created"] > 0 or stats["failed"] > 0:
                print(f"  {entity.capitalize()}: {stats['created']} creados, {stats['failed']} fallidos")
        
        print(f"\n  Total: {total_created} creados, {total_failed} fallidos")


async def main():
    parser = argparse.ArgumentParser(description="Poblar base de datos para stress testing")
    parser.add_argument("--users", type=int, default=100, help="Cantidad de usuarios a crear")
    parser.add_argument("--competencias", type=int, default=30, help="Cantidad de competencias a crear")
    parser.add_argument("--full", action="store_true", help="Crear datos completos (100 users, 50 competencias)")
    parser.add_argument("--generate-csv", action="store_true", help="Generar archivo CSV con usuarios")
    parser.add_argument("--csv-file", type=str, default="users.csv", help="Nombre del archivo CSV")
    parser.add_argument("--api-url", type=str, default=API_BASE_URL, help="URL base del API")
    
    args = parser.parse_args()
    
    if args.full:
        args.users = 100
        args.competencias = 50
    
    print_header("POBLADOR DE BASE DE DATOS PARA LOCUST")
    print_info(f"API URL: {args.api_url}")
    print_info(f"Usuarios: {args.users}")
    print_info(f"Competencias: {args.competencias}")
    
    async with DatabasePopulator(args.api_url) as populator:
        # Verificar API
        if not await populator.check_health():
            print_error("No se puede conectar al API. Asegúrate de que el servidor esté corriendo.")
            sys.exit(1)
        
        # Verificar rutas de test
        if not await populator.check_test_routes():
            print_error("Las rutas de test no están habilitadas.")
            print_error("Configura ENABLE_TEST_ROUTES=true en el backend.")
            sys.exit(1)
        
        # Crear usuarios
        await populator.create_test_users(args.users)
        
        # Crear competencias
        await populator.create_competencias(args.competencias)
        
        # Generar CSV si se solicita
        if args.generate_csv:
            await populator.generate_csv(args.users, args.csv_file)
        
        # Imprimir resumen
        populator.print_summary()
    
    print_success("\n¡Listo! Ahora puedes ejecutar Locust:")
    print(f"  locust -f locust/locustfile.py --host={args.api_url}")


if __name__ == "__main__":
    asyncio.run(main())
