"""
Script de utilidad para depurar la carga de variables de entorno (Settings).
Permite verificar rápidamente si la configuración (Pydantic Settings) se carga correctamente
o muestra errores de validación detallados.
"""
import sys
import os

# Agregar path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

try:
    from app.core.config.enviroment import _SETTINGS
    print("✅ Settings loaded successfully")
    print(f"DB URL: {_SETTINGS.database_url_async}")
except Exception as e:
    print(f"❌ Error loading settings: {e}")
    # Print detailed pydantic validation error if available
    if hasattr(e, 'errors'):
        import json
        print(json.dumps(e.errors(), indent=2))
