import asyncio
import sys
import os

sys.path.append(os.getcwd())

from app.core.db.database import async_session_maker
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.resultado_entrenamiento_model import ResultadoEntrenamiento
from sqlalchemy import select
from sqlalchemy.orm import selectinload

async def inspect_data():
    async with async_session_maker() as session:
        # Fetch Results
        print("--- RESULTADOS ENTRENAMIENTO ---")
        q_res = select(ResultadoEntrenamiento)
        results = (await session.execute(q_res)).scalars().all()
        for r in results:
            print(f"Result ID: {r.id}, Atleta ID: {r.atleta_id}, Eval: {r.evaluacion}")

        # Fetch Athletes
        print("\n--- ATLETAS ---")
        q_atl = select(Atleta).options(selectinload(Atleta.user))
        athletes = (await session.execute(q_atl)).scalars().all()
        for a in athletes:
            name = f"{a.user.first_name} {a.user.last_name}" if a.user else "No User"
            username = a.user.username if a.user else "No User"
            print(f"ID: {a.id} (External: {a.external_id}) -> Name: {name}, Username: {username}")

if __name__ == "__main__":
    asyncio.run(inspect_data())
