"""
Script para verificar la conexión a la base de datos antes de iniciar la aplicación.
Espera hasta que la base de datos esté disponible.
"""
import os
import sys
import time
import asyncio

# Número máximo de intentos
MAX_RETRIES = 30
RETRY_INTERVAL = 2  # segundos


async def check_database_connection():
    """Verifica la conexión a la base de datos."""
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy import text
    
    database_url = os.getenv("DATABASE_URL", "")
    
    if not database_url:
        print("ERROR: DATABASE_URL no está configurada")
        sys.exit(1)
    
    # Convertir postgres:// a postgresql+asyncpg://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    engine = create_async_engine(database_url, echo=False)
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                print(f"✓ Conexión a la base de datos exitosa (intento {attempt})")
                await engine.dispose()
                return True
        except Exception as e:
            print(f"Intento {attempt}/{MAX_RETRIES}: Esperando base de datos... ({type(e).__name__})")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_INTERVAL)
            else:
                print(f"ERROR: No se pudo conectar a la base de datos después de {MAX_RETRIES} intentos")
                print(f"Último error: {e}")
                await engine.dispose()
                sys.exit(1)
    
    return False


if __name__ == "__main__":
    asyncio.run(check_database_connection())
