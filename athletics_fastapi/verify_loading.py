import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from app.core.db.database import async_session_maker
from app.modules.entrenador.repositories.resultado_entrenamiento_repository import ResultadoEntrenamientoRepository
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def test_loading():
    async with async_session_maker() as session:
        repo = ResultadoEntrenamientoRepository(session)
        print("Attempting to fetch with eager loading...")
        try:
            results = await repo.get_all()
            print(f"Success! Fetched {len(results)} results.")
            if results:
                first = results[0]
                print(f"First result: {first.id}")
                print(f"Atleta: {first.atleta.id}, User: {first.atleta.user.first_name}")
                print(f"Entrenamiento: {first.entrenamiento.tipo_entrenamiento}")
        except Exception as e:
            print(f"caught error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_loading())
