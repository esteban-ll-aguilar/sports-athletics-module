import asyncio
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

CONNECTION_STRING = "postgresql+asyncpg://postgres:admin@localhost:5432/sport"

async def check_atleta():
    engine = create_async_engine(CONNECTION_STRING)
    target_uuid_str = "8247b20e-03b1-4e78-9a8d-05d39ff5476d"
    
    print(f"Connecting to DB: sport")
    
    async with engine.connect() as conn:
        # Check raw SQL
        print(f"Checking Atleta UUID: {target_uuid_str}")
        result = await conn.execute(text(f"SELECT id, user_id, external_id FROM atleta WHERE external_id = '{target_uuid_str}'"))
        row = result.first()
        if row:
            print(f"✅ Found Atleta! ID: {row.id}, UserID: {row.user_id}")
            
            # Check User existence
            user_res = await conn.execute(text(f"SELECT id, email FROM users WHERE id = {row.user_id}"))
            user_row = user_res.first()
            if user_row:
                 print(f"✅ Found Linked User! ID: {user_row.id}, Email: {user_row.email}")
            else:
                 print(f"❌ Linked User {row.user_id} NOT FOUND.")
        else:
            print(f"❌ Atleta with UUID {target_uuid_str} NOT FOUND.")
            
            # List ALL athletes to compare
            print("Listing ALL athletes found in DB:")
            all_res = await conn.execute(text("SELECT id, user_id, external_id FROM atleta"))
            for r in all_res:
                print(f" - DB ID: {r.id}, UserID: {r.user_id}, UUID: {r.external_id}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_atleta())
