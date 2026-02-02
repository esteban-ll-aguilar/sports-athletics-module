#!/usr/bin/env python3
"""
Script para poblar la base de datos con datos de prueba para stress testing.

⚠️ LIMITACIONES ARQUITECTÓNICAS:
   Este microservicio usa autenticación basada en roles del servicio externo.
   Solo funciona con admin:
   ✅ Competencias (CREATE/READ/UPDATE/DELETE)
   ❌ Atletas (requiere usuarios con rol ATLETA del servicio externo)
   ❌ Entrenamientos (requiere usuarios con rol ENTRENADOR)
   
   Ver LIMITACIONES_POBLACION.md para más detalles.

Uso:
    python populate_database.py --competencias 30
    python populate_database.py --full  # Crea 50 competencias
    python populate_database.py --generate-csv --csv-users 100
"""

import sys
import os
import argparse
import asyncio
from typing import List, Dict
import httpx
from utils.utils import (
    generar_atleta,
    generar_entrenador,
    generar_entrenamiento,
    generar_competencia,
    generar_usuario,
    generar_usuarios_csv
)

# Configuración
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
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
    UNDERLINE = '\033[4m'


def print_info(message: str):
    """Imprime mensaje informativo."""
    print(f"{Colors.OKBLUE}ℹ️  {message}{Colors.ENDC}")


def print_success(message: str):
    """Imprime mensaje de éxito."""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")


def print_error(message: str):
    """Imprime mensaje de error."""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")


def print_warning(message: str):
    """Imprime mensaje de advertencia."""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")


def print_header(message: str):
    """Imprime encabezado."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


class DatabasePopulator:
    """Clase para poblar la base de datos con datos de prueba."""
    
    def __init__(self, base_url: str = API_BASE_URL):
        self.base_url = base_url
        self.client = None
        self.auth_token = None
        self.stats = {
            "atletas": {"created": 0, "failed": 0},
            "entrenadores": {"created": 0, "failed": 0},
            "entrenamientos": {"created": 0, "failed": 0},
            "competencias": {"created": 0, "failed": 0},
            "usuarios": {"created": 0, "failed": 0}
        }
    
    async def __aenter__(self):
        """Inicializa el cliente HTTP."""
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=API_TIMEOUT,
            follow_redirects=True
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cierra el cliente HTTP."""
        if self.client:
            await self.client.aclose()
    
    async def authenticate(self, email: str = "admin@test.com", password: str = "Admin123!"):
        """
        Autentica con el API y obtiene token.
        
        Args:
            email: Email del usuario administrador
            password: Contraseña
            
        Returns:
            True si la autenticación fue exitosa
        """
        print_info(f"Autenticando como {email}...")
        
        try:
            response = await self.client.post(
                "/api/v1/auth/login",
                json={"username": email, "password": password}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token") or data.get("data", {}).get("access_token")
                
                if self.auth_token:
                    self.client.headers.update({
                        "Authorization": f"Bearer {self.auth_token}"
                    })
                    print_success("Autenticación exitosa")
                    return True
                else:
                    print_error("No se encontró token en la respuesta")
                    return False
            else:
                print_error(f"Autenticación fallida: {response.status_code}")
                print_error(f"Respuesta: {response.text}")
                return False
                
        except Exception as e:
            print_error(f"Error en autenticación: {str(e)}")
            return False
    
    async def check_health(self) -> bool:
        """Verifica que el API esté disponible."""
        print_info(f"Verificando disponibilidad del API en {self.base_url}...")
        
        try:
            response = await self.client.get("/health")
            
            if response.status_code == 200:
                print_success("API está disponible")
                return True
            else:
                print_error(f"API respondió con código {response.status_code}")
                return False
                
        except Exception as e:
            print_error(f"No se pudo conectar al API: {str(e)}")
            return False
    
    async def crear_atleta(self, datos: Dict) -> bool:
        """
        NOTA: Este endpoint requiere rol ATLETA, el admin no puede crear atletas.
        Por ahora se salta para evitar errores 403.
        Ver LIMITACIONES_POBLACION.md para más detalles.
        """
        # Saltamos la creación por restricción de roles
        self.stats["atletas"]["failed"] += 1
        if self.stats["atletas"]["failed"] == 1:
            print_warning("Endpoint de atletas requiere rol ATLETA (no disponible para admin)")
            print_info("Ver LIMITACIONES_POBLACION.md para alternativas")
        return False
    
    async def crear_entrenador(self, datos: Dict) -> bool:
        """
        NOTA: Endpoint de entrenador no existe en la estructura actual.
        El sistema solo permite que usuarios con rol ENTRENADOR gestionen entrenamientos.
        """
        self.stats["entrenadores"]["failed"] += 1
        if self.stats["entrenadores"]["failed"] == 1:
            print_warning("Endpoint de entrenadores no disponible (arquitectura de microservicios)")
        return False
    
    async def crear_entrenamiento(self, datos: Dict) -> bool:
        """Crea un entrenamiento en el sistema."""
        try:
            response = await self.client.post("/api/v1/entrenador/entrenamientos/", json=datos)
            
            if response.status_code in [200, 201]:
                self.stats["entrenamientos"]["created"] += 1
                return True
            else:
                self.stats["entrenamientos"]["failed"] += 1
                if self.stats["entrenamientos"]["failed"] <= 3:
                    print_warning(f"Error al crear entrenamiento: {response.status_code}")
                return False
        except Exception as e:
            self.stats["entrenamientos"]["failed"] += 1
            if self.stats["entrenamientos"]["failed"] <= 3:
                print_warning(f"Excepción al crear entrenamiento: {str(e)}")
            return False
           
    async def crear_competencia(self, datos: Dict) -> bool:
        """Crea una competencia en el sistema."""
        try:
            response = await self.client.post("/api/v1/competencia/competencias", json=datos)
            
            if response.status_code in [200, 201]:
                self.stats["competencias"]["created"] += 1
                return True
            else:
                self.stats["competencias"]["failed"] += 1
                if self.stats["competencias"]["failed"] <= 3:
                    print_warning(f"Error al crear competencia: {response.status_code}")
                return False
                
        except Exception as e:
            self.stats["competencias"]["failed"] += 1
            if self.stats["competencias"]["failed"] <= 3:
                print_warning(f"Excepción al crear competencia: {str(e)}")
            return False
    
    async def poblar_atletas(self, cantidad: int):
        """Puebla la BD con atletas."""
        print_header(f"CREANDO {cantidad} ATLETAS")
        
        for i in range(cantidad):
            datos = generar_atleta()
            await self.crear_atleta(datos)
            
            # Progress indicator
            if (i + 1) % 10 == 0:
                print_info(f"Progreso: {i + 1}/{cantidad} atletas procesados...")
        
        print_success(f"Atletas creados: {self.stats['atletas']['created']}")
        if self.stats['atletas']['failed'] > 0:
            print_warning(f"Atletas fallidos: {self.stats['atletas']['failed']}")
    
    async def poblar_entrenadores(self, cantidad: int):
        """Puebla la BD con entrenadores."""
        print_header(f"CREANDO {cantidad} ENTRENADORES")
        
        for i in range(cantidad):
            datos = generar_entrenador()
            await self.crear_entrenador(datos)
            
            if (i + 1) % 5 == 0:
                print_info(f"Progreso: {i + 1}/{cantidad} entrenadores procesados...")
        
        print_success(f"Entrenadores creados: {self.stats['entrenadores']['created']}")
        if self.stats['entrenadores']['failed'] > 0:
            print_warning(f"Entrenadores fallidos: {self.stats['entrenadores']['failed']}")
    
    async def poblar_entrenamientos(self, cantidad: int):
        """Puebla la BD con entrenamientos."""
        print_header(f"CREANDO {cantidad} ENTRENAMIENTOS")
        
        for i in range(cantidad):
            datos = generar_entrenamiento()
            await self.crear_entrenamiento(datos)
            
            if (i + 1) % 10 == 0:
                print_info(f"Progreso: {i + 1}/{cantidad} entrenamientos procesados...")
        
        print_success(f"Entrenamientos creados: {self.stats['entrenamientos']['created']}")
        if self.stats['entrenamientos']['failed'] > 0:
            print_warning(f"Entrenamientos fallidos: {self.stats['entrenamientos']['failed']}")
    
    async def poblar_competencias(self, cantidad: int):
        """Puebla la BD con competencias."""
        print_header(f"CREANDO {cantidad} COMPETENCIAS")
        
        for i in range(cantidad):
            datos = generar_competencia()
            await self.crear_competencia(datos)
            
            if (i + 1) % 5 == 0:
                print_info(f"Progreso: {i + 1}/{cantidad} competencias procesadas...")
        
        print_success(f"Competencias creadas: {self.stats['competencias']['created']}")
        if self.stats['competencias']['failed'] > 0:
            print_warning(f"Competencias fallidas: {self.stats['competencias']['failed']}")
    
    def imprimir_resumen(self):
        """Imprime resumen de la población de datos."""
        print_header("RESUMEN DE POBLACIÓN DE DATOS")
        
        total_created = sum(cat["created"] for cat in self.stats.values())
        total_failed = sum(cat["failed"] for cat in self.stats.values())
        
        print(f"{Colors.BOLD}Entidad{' '*15}| Creados | Fallidos{Colors.ENDC}")
        print("-" * 50)
        
        for entidad, stats in self.stats.items():
            entidad_nombre = entidad.capitalize()
            espacios = ' ' * (20 - len(entidad_nombre))
            print(f"{entidad_nombre}{espacios}| {stats['created']:>7} | {stats['failed']:>8}")
        
        print("-" * 50)
        print(f"{Colors.BOLD}TOTAL{' '*15}| {total_created:>7} | {total_failed:>8}{Colors.ENDC}")
        
        if total_failed == 0:
            print_success("\n¡Población de datos completada exitosamente!")
        else:
            print_warning(f"\nPoblación completada con {total_failed} errores")


async def main():
    """Función principal."""
    parser = argparse.ArgumentParser(description="Poblar BD con datos de prueba para stress testing")
    
    parser.add_argument("--atletas", type=int, default=0, help="[NO SOPORTADO] Requiere usuarios con rol ATLETA (default: 0)")
    parser.add_argument("--entrenadores", type=int, default=0, help="[NO SOPORTADO] Endpoint no disponible (default: 0)")
    parser.add_argument("--entrenamientos", type=int, default=0, help="[NO SOPORTADO] Requiere rol ENTRENADOR (default: 0)")
    parser.add_argument("--competencias", type=int, default=20, help="✅ Cantidad de competencias a crear (default: 20)")
    parser.add_argument("--full", action="store_true", help="✅ Carga completa: 50 competencias (arquitectura no permite atletas/entrenamientos)")
    parser.add_argument("--api-url", type=str, default=API_BASE_URL, help=f"URL del API (default: {API_BASE_URL})")
    parser.add_argument("--generate-csv", action="store_true", help="Genera archivo CSV de usuarios para JMeter/Gatling")
    parser.add_argument("--csv-users", type=int, default=100, help="Cantidad de usuarios en CSV (default: 100)")
    
    args = parser.parse_args()
    
    print_header("🏃 POBLADOR DE BASE DE DATOS - STRESS TESTING")
    
    # Generar CSV si se solicita
    if args.generate_csv:
        print_info(f"Generando archivo CSV con {args.csv_users} usuarios...")
        archivo = generar_usuarios_csv(args.csv_users, "jmeter/data/users.csv")
        print_success(f"Archivo CSV generado: {archivo}")
        
        # También generar para Gatling
        archivo_gatling = generar_usuarios_csv(args.csv_users, "gatling/resources/users.csv")
        print_success(f"Archivo CSV para Gatling generado: {archivo_gatling}")
    
    # Ajustar cantidades si se solicita carga completa
    if args.full:
        print_info("Modo FULL activado - Se crearán 50 competencias")
        args.atletas = 0  # No soportado (requiere rol ATLETA)
        args.entrenadores = 0  # No soportado (endpoint no existe)
        args.entrenamientos = 0  # No soportado (requiere rol ENTRENADOR)
        args.competencias = 50  # ✅ Funciona con admin
    
    # Inicializar poblador
    async with DatabasePopulator(args.api_url) as populator:
        # Verificar salud del API
        if not await populator.check_health():
            print_error("El API no está disponible. Verifica que esté ejecutándose.")
            sys.exit(1)
        
        # Autenticar
        if not await populator.authenticate():
            print_error("No se pudo autenticar. Verifica las credenciales.")
            print_info("Asegúrate de que exista un usuario admin con email: admin@test.com y password: Admin123!")
            sys.exit(1)
        
        # Poblar datos
        try:
            if args.atletas > 0:
                await populator.poblar_atletas(args.atletas)
            
            if args.entrenadores > 0:
                await populator.poblar_entrenadores(args.entrenadores)
            
            if args.entrenamientos > 0:
                await populator.poblar_entrenamientos(args.entrenamientos)
            
            if args.competencias > 0:
                await populator.poblar_competencias(args.competencias)
            
            # Imprimir resumen
            populator.imprimir_resumen()
            
        except KeyboardInterrupt:
            print_warning("\n\n⚠️  Proceso interrumpido por el usuario")
            populator.imprimir_resumen()
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
