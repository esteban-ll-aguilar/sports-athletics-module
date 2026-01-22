#!/usr/bin/env python3
"""
Script para resetear la secuencia de IDs en PostgreSQL
Resuelve el error: "Ya existe la llave (id)=(2)"
"""

import asyncio
from sqlalchemy import text
from app.core.db.database import DatabaseBase

async def fix_sequence():
    """Resetea la secuencia de IDs en la tabla users"""
    db = DatabaseBase()
    engine = db.get_engine()
    
    try:
        async with engine.connect() as conn:
            # Obtener el máximo ID actual
            result = await conn.execute(text("SELECT MAX(id) FROM users;"))
            max_id = result.scalar()
            
            print(f"✅ Máximo ID actual en la tabla: {max_id}")
            
            if max_id is None:
                max_id = 0
                print("⚠️  La tabla está vacía, estableciendo secuencia a 1")
            
            # Resetear la secuencia
            next_id = max_id + 1
            query = f"SELECT setval('users_id_seq', {next_id});"
            await conn.execute(text(query))
            await conn.commit()
            
            print(f"✅ Secuencia reseteada a: {next_id}")
            print("✨ El problema debe estar resuelto. Intenta registrar nuevamente.")
            
    except Exception as e:
        print(f"❌ Error al resetear la secuencia: {str(e)}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    print("🔧 Iniciando reparación de secuencia de IDs...")
    asyncio.run(fix_sequence())
