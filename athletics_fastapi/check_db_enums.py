
import asyncio
from sqlalchemy import text
from app.core.db.database import get_session

async def check_enums():
    async for session in get_session():
        result = await session.execute(
            text("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'roleenum'")
        )
        labels = [row[0] for row in result.all()]
        with open("enum_results.txt", "w") as f:
            f.write(f"Current roleenum labels: {labels}")
        print(f"Current roleenum labels: {labels}")
        break

if __name__ == "__main__":
    asyncio.run(check_enums())
