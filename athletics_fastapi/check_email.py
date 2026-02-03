
import asyncio
from sqlalchemy import select
from app.core.db.database import get_session
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

async def check_user():
    async for session in get_session():
        result = await session.execute(
            select(AuthUserModel).where(AuthUserModel.email.ilike('jairalejandro@gmail.com'))
        )
        users = result.scalars().all()
        print(f"Found {len(users)} users with email (case-insensitive):")
        for u in users:
            print(f"ID: {u.id}, Email: '{u.email}', Active: {u.is_active}")
        
        result_exact = await session.execute(
            select(AuthUserModel).where(AuthUserModel.email == 'jairalejandro@gmail.com')
        )
        user_exact = result_exact.scalar_one_or_none()
        print(f"Exact match for 'jairalejandro@gmail.com': {user_exact.id if user_exact else 'None'}")
        break

if __name__ == "__main__":
    asyncio.run(check_user())
