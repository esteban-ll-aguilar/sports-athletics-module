import asyncio
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

CONNECTION_STRING = "postgresql+asyncpg://postgres:admin@localhost:5432/sport"

async def check_data():
    engine = create_async_engine(CONNECTION_STRING)
    target_uuid_str = "74d2296d-2dfd-4b41-b538-caa0b4ea9cfb"
    
    print(f"Connecting to DB: sport")
    
    async with engine.connect() as conn:
        # List all rows
        print("Listing ALL rows in entrenamiento:")
        result_all = await conn.execute(text("SELECT id, tipo_entrenamiento, external_id, entrenador_id FROM entrenamiento"))
        for r in result_all:
             print(f"ROW: ID={r.id}, Type={r.tipo_entrenamiento}, UUID={r.external_id}, TrainerID={r.entrenador_id}")
             
             # Check if trainer exists
             trainer_chk = await conn.execute(text(f"SELECT id FROM entrenador WHERE id = {r.entrenador_id}"))
             if trainer_chk.first():
                 print(f"   -> Trainer {r.entrenador_id} FOUND.")
             else:
                 print(f"   -> Trainer {r.entrenador_id} MISSING! This causes fetch failure.")
            
        # Check count
        result_count = await conn.execute(text("SELECT count(*) FROM entrenamiento"))
        print(f"Total rows in entrenamiento: {result_count.scalar()}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_data())
