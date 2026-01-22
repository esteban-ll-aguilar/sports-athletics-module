"""
Runner principal para pruebas de integración.
Ejecuta las pruebas de integración después de los tests unitarios.
"""
import sys
import subprocess
import os


def print_banner(mensaje: str, color: str = "94"):
    """Imprime un banner colorido"""
    print(f"\033[{color}m {'=' * 60}\033[0m")
    print(f"\033[{color}m {mensaje.center(60)} \033[0m")
    print(f"\033[{color}m {'=' * 60}\033[0m\n")


def run_integration_tests():
    """Ejecuta las pruebas de integración con pytest"""
    print_banner("🧪 RUNNING INTEGRATION TESTS", "96")
    
    # Directorio de integration tests
    integration_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__))
    )
    
    # Comando pytest con configuraciones
    pytest_args = [
        sys.executable,
        "-m", "pytest",
        integration_dir,
        "-v",                    # Verbose
        "--tb=short",           # Traceback corto
        "--color=yes",          # Colores
        "-s",                   # Mostrar prints
        "--asyncio-mode=auto",  # Modo async automático
        f"--rootdir={os.path.dirname(os.path.dirname(integration_dir))}"
    ]
    
    print(f"📂 Integration tests directory: {integration_dir}")
    print(f"🔧 Pytest command: {' '.join(pytest_args)}\n")
    
    # Ejecutar pytest
    result = subprocess.run(
        pytest_args,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    
    return result.returncode


def main():
    """Función principal"""
    print_banner("🚀 INTEGRATION TESTS SUITE", "94")
    
    print("ℹ️ Integration tests check:")
    print("  ✓ Database connectivity and operations")
    print("  ✓ Redis cache functionality")
    print("  ✓ Email service configuration")
    print("  ✓ API endpoints and authentication")
    print("  ✓ External services integration")
    print()
    
    # Ejecutar integration tests
    exit_code = run_integration_tests()
    
    if exit_code == 0:
        print_banner("✅ ALL INTEGRATION TESTS PASSED", "92")
        print("\n🎉 Integration suite completed successfully!")
        print("📊 All services are properly integrated and functioning.\n")
    else:
        print_banner("❌ SOME INTEGRATION TESTS FAILED", "91")
        print("\n⚠️ Check the output above for details.")
        print("💡 Tip: Ensure all services (DB, Redis, etc.) are running.\n")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
