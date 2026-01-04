"""Script para ejecutar migraciones de Alembic facilmente"""
import subprocess
import sys
import os
from pathlib import Path

def run_migration(command):
    """Ejecuta un comando de alembic."""
    try:
        print(f"🔄 Ejecutando: alembic {' '.join(command)}")
        print("-" * 60)
        
        # Cambiar al directorio del script
        script_dir = Path(__file__).parent
        os.chdir(script_dir)
        
        result = subprocess.run(
            ["alembic"] + command,
            capture_output=False
        )
        
        print("-" * 60)
        if result.returncode == 0:
            print("✅ Operación exitosa")
            return True
        else:
            print("❌ Error en la operación")
            return False
            
    except FileNotFoundError:
        print("❌ Error: 'alembic' no está instalado")
        print("Instálalo con: pip install alembic")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def show_help():
    """Mostrar ayuda."""
    print("""
╔════════════════════════════════════════════════════════════════╗
║              HERRAMIENTA DE MIGRACIONES - ALEMBIC              ║
╚════════════════════════════════════════════════════════════════╝

COMANDOS DISPONIBLES:

1. Aplicar todas las migraciones pendientes:
   python migrate.py upgrade head

2. Revertir la última migración:
   python migrate.py downgrade -1

3. Ver estado actual:
   python migrate.py current

4. Ver historial de migraciones:
   python migrate.py history

5. Crear nueva migración automática:
   python migrate.py revision --autogenerate -m "Descripción"

6. Marcar como migración actual (sin aplicar):
   python migrate.py stamp head

EJEMPLOS:

   # Aplicar todas las migraciones
   python migrate.py upgrade head

   # Revertir 2 migraciones
   python migrate.py downgrade -2

   # Ver versión actual
   python migrate.py current

   # Crear nueva migración
   python migrate.py revision --autogenerate -m "Agregar tabla usuarios"

╔════════════════════════════════════════════════════════════════╗
    """)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)
    
    command = sys.argv[1:]
    success = run_migration(command)
    sys.exit(0 if success else 1)
