
import asyncio
import os
import sys

sys.path.append(os.getcwd())

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.config.enviroment import _SETTINGS
from app.core.db.database import get_session
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def check_data():
    engine = create_async_engine(_SETTINGS.database_url_async)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Buscar usuarios con rol ATLETA
        stmt = select(UserModel).where(UserModel.role == RoleEnum.ATLETA).options(
            selectinload(UserModel.atleta)
        )
        result = await session.execute(stmt)
        users = result.scalars().all()
        
        print(f"Total usuarios con rol ATLETA: {len(users)}")
        for u in users:
            has_atleta = u.atleta is not None
            ext_id = u.atleta.external_id if has_atleta else "N/A"
            print(f"- User: {u.username}, Has Atleta Record: {has_atleta}, Atleta Ext ID: {ext_id}")

if __name__ == "__main__":
    asyncio.run(check_data())
