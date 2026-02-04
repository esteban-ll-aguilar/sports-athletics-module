import asyncio
from sqlalchemy import select
from app.core.db.database import get_session_context
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

async def main():
    async with get_session_context() as session:
        print("--- Debugging Database ---")
        
        # Count Auth Users
        result = await session.execute(select(AuthUserModel))
        auth_users = result.scalars().all()
        print(f"Total Auth Users: {len(auth_users)}")
        for u in auth_users:
            print(f"  AuthUser ID: {u.id}, Email: {u.email}")

        # Count Users
        result = await session.execute(select(UserModel))
        users = result.scalars().all()
        print(f"\nTotal User Profiles: {len(users)}")
        for u in users:
            print(f"  User ID: {u.id}, AuthID: {u.auth_user_id}, Name: {u.first_name} {u.last_name}")

        # Count Athletes
        result = await session.execute(select(Atleta))
        atletas = result.scalars().all()
        print(f"\nTotal Athletes: {len(atletas)}")
        for a in atletas:
            print(f"  Atleta ID: {a.id}, User ID: {a.user_id}")
            
if __name__ == "__main__":
    asyncio.run(main())
