import asyncio
import uuid
from sqlalchemy import select
from app.core.db.database import session_manager
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from fast_auth.auth_config import FastAuthConfig

async def check_data():
    await session_manager.init(FastAuthConfig.DATABASE_URL_ASYNC)
    
    target_uuid_str = "74d2296d-2dfd-4b41-b538-caa0b4ea9cfb"
    target_uuid = uuid.UUID(target_uuid_str)
    
    print(f"Checking for Entrenamiento with UUID: {target_uuid}")
    
    async with session_manager.session() as session:
        # 1. Direct verify with raw select
        stmt = select(Entrenamiento).where(Entrenamiento.external_id == target_uuid)
        result = await session.execute(stmt)
        ent = result.scalars().first()
        
        if ent:
            print(f"✅ Found in DB directly! ID: {ent.id}, Type: {ent.tipo_entrenamiento}")
        else:
            print("❌ Not found in DB via direct select.")
            
        # 2. Verify via Repository method
        repo = EntrenamientoRepository(session)
        if hasattr(repo, 'get_by_external_id'):
            try:
                repo_ent = await repo.get_by_external_id(target_uuid)
                if repo_ent:
                    print(f"✅ Found via Repository! ID: {repo_ent.id}")
                else:
                    print("❌ Not found via Repository method.")
            except Exception as e:
                print(f"❌ Error calling repository: {e}")
        else:
            print("❌ Repository does not have get_by_external_id method.")

if __name__ == "__main__":
    asyncio.run(check_data())
