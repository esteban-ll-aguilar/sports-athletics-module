
import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.representante.domain.models.representante_model import Representante

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.config.enviroment import _SETTINGS
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def check_data():
    engine = create_async_engine(_SETTINGS.database_url_async)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        stmt = select(UserModel).options(selectinload(UserModel.atleta))
        result = await session.execute(stmt)
        users = result.scalars().all()
        
        print(f"DEBUG: TOTAL_USERS={len(users)}")
        for u in users:
            print(f"DEBUG: USER={u.username} ROLE={u.role} HAS_ATLETA={u.atleta is not None}")

if __name__ == "__main__":
    asyncio.run(check_data())
