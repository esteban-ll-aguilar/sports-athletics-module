
import asyncio
import os
import sys

sys.path.append(os.getcwd())

# Import all models to ensure mappers are initialized
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.competencia.domain.models.competencia_model import Competencia
from app.modules.competencia.domain.models.prueba_model import Prueba
from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.config.enviroment import _SETTINGS
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
        if not users:
            # Check all users just in case role is lowercase or something
            stmt_all = select(UserModel)
            res_all = await session.execute(stmt_all)
            all_users = res_all.scalars().all()
            print(f"Total usuarios en DB: {len(all_users)}")
            for u in all_users:
                print(f"  - User: {u.username}, Role: {u.role}")

        for u in users:
            has_atleta = u.atleta is not None
            ext_id = u.atleta.external_id if has_atleta else "N/A"
            print(f"- User: {u.username}, Has Atleta Record: {has_atleta}, Atleta Ext ID: {ext_id}")

if __name__ == "__main__":
    asyncio.run(check_data())
