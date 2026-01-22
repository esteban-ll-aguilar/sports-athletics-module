"""
Script principal de ejecución de pruebas.
Configura el path de Python y lanza pytest con los argumentos necesarios
para descubrir y ejecutar todos los tests en el directorio 'tests'.
"""
import pytest
import sys
import os

if __name__ == "__main__":
    # Obtener el directorio base (athletics_fastapi)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Agregar el directorio base al path de python para que los imports funcionen
    sys.path.insert(0, base_dir)
    
    print(f"Running tests in: {base_dir}")
    
    # Argumentos para pytest
    # -v: verbose
    # -s: mostrar stdout (print)
    # --asyncio-mode=auto: configurar asyncio
    args = [
        "-v",
        "--asyncio-mode=auto",
        "tests"
    ]
    
    # Ejecutar pytest
    exit_code = pytest.main(args)

    if exit_code == 0:
        print("\n✅ All tests passed!")
    else:
        print(f"\n❌ Tests failed with exit code: {exit_code}")
    
    sys.exit(exit_code)
