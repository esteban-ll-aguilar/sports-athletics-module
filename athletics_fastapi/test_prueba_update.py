
import asyncio
import os
import sys
from uuid import UUID

# Mock settings/env if needed, but let's try to import app
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config.enviroment import _SETTINGS
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.services.prueba_service import PruebaService
from app.modules.competencia.domain.schemas.prueba_schema import PruebaUpdate

async def test_update():
    engine = create_async_engine(_SETTINGS.database_url_async)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        repo = PruebaRepository(session)
        service = PruebaService(repo)
        
        # Primero necesitamos un external_id que exista. 
        # Vamos a listar una.
        pruebas = await service.get_pruebas(limit=1)
        if not pruebas:
            print("No hay pruebas para testear.")
            return
        
        target = pruebas[0]
        ext_id = target.external_id
        print(f"Testing update for: {ext_id}")
        
        data = PruebaUpdate(siglas="TESTING")
        try:
            updated = await service.update_prueba(ext_id, data)
            print(f"Successfully updated: {updated.siglas}")
        except Exception as e:
            print(f"❌ Update failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_update())
