"""
Script auxiliar para ejecutar tipos específicos de pruebas de integración.
Permite ejecutar tests por categoría o servicio.
"""
import sys
import subprocess
import os
import argparse


def print_header(text: str):
    """Imprime un header colorido"""
    print(f"\n\033[94m{'=' * 60}\033[0m")
    print(f"\033[94m{text.center(60)}\033[0m")
    print(f"\033[94m{'=' * 60}\033[0m\n")


def run_tests(test_file: str = None, marker: str = None, verbose: bool = True):
    """Ejecuta tests con filtros específicos"""
    integration_dir = os.path.dirname(os.path.abspath(__file__))
    
    pytest_args = [
        sys.executable,
        "-m", "pytest",
        "-v" if verbose else "",
        "--tb=short",
        "--color=yes",
        "-s",
        "--asyncio-mode=auto",
    ]
    
    # Filtrar por archivo
    if test_file:
        pytest_args.append(os.path.join(integration_dir, test_file))
    else:
        pytest_args.append(integration_dir)
    
    # Filtrar por marker
    if marker:
        pytest_args.extend(["-m", marker])
    
    # Remover strings vacíos
    pytest_args = [arg for arg in pytest_args if arg]
    
    print(f"🔧 Command: {' '.join(pytest_args)}\n")
    
    result = subprocess.run(
        pytest_args,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    
    return result.returncode


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(
        description="🧪 Runner para pruebas de integración específicas"
    )
    
    parser.add_argument(
        "--type",
        choices=["database", "redis", "email", "api", "external", "all"],
        default="all",
        help="Tipo de pruebas a ejecutar"
    )
    
    parser.add_argument(
        "--marker",
        help="Marker de pytest para filtrar (ej: 'slow', 'external')"
    )
    
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        default=True,
        help="Output verboso"
    )
    
    parser.add_argument(
        "--quick",
        action="store_true",
        help="Solo tests rápidos (excluye 'slow')"
    )
    
    args = parser.parse_args()
    
    # Mapeo de tipos a archivos
    type_to_file = {
        "database": "tests/test_database_integration.py",
        "redis": "tests/test_redis_integration.py",
        "email": "tests/test_email_integration.py",
        "api": "tests/test_api_integration.py",
        "external": "tests/test_external_services.py",
        "all": None,
    }
    
    test_file = type_to_file.get(args.type)
    
    # Determinar marker
    marker = args.marker
    if args.quick and not marker:
        marker = "not slow"
    
    # Header
    if args.type == "all":
        print_header("🧪 Running ALL Integration Tests")
    else:
        print_header(f"🧪 Running {args.type.upper()} Integration Tests")
    
    # Ejecutar tests
    exit_code = run_tests(test_file, marker, args.verbose)
    
    # Resultado
    if exit_code == 0:
        print_header("✅ Tests Passed")
    else:
        print_header("❌ Tests Failed")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
