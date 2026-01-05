import asyncio
import sys
import logging
from sqlalchemy import select
from app.core.db.database import _db
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico

# Disable SQLAlchemy logs
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

async def debug_athletes(email: str):
    with open("debug_output.txt", "w", encoding="utf-8") as f:
        f.write(f"checking athletes for email: {email}\n")
        
        async with _db.get_session_factory()() as session:
            # Find user
            result = await session.execute(select(AuthUserModel).where(AuthUserModel.email == email))
            user = result.scalar_one_or_none()
            
            if not user:
                f.write("User not found!\n")
                return
                
            f.write(f"User Found: ID={user.id} - Email={user.email} - Role={user.role}\n")
            
            # Check Representante
            result = await session.execute(select(Representante).where(Representante.user_id == user.id))
            representante = result.scalar_one_or_none()
            
            if not representante:
                f.write("User is NOT a Representante table entry!\n")
            else:
                f.write(f"Representante ID: {representante.id}\n")
                
                # Check Athletes
                result = await session.execute(select(Atleta).where(Atleta.representante_id == representante.id))
                athletes = result.scalars().all()
                
                f.write(f"Found {len(athletes)} athletes linked to Representante {representante.id}:\n")
                for a in athletes:
                    f.write(f" - Atleta ID: {a.id}, User ID: {a.user_id}, Rep ID: {a.representante_id}\n")

            # Check ALL athletes just in case
            f.write("--- All Athletes in DB ---\n")
            result = await session.execute(select(Atleta))
            all_athletes = result.scalars().all()
            for a in all_athletes:
                 f.write(f" - Atleta ID: {a.id}, User ID: {a.user_id}, Rep ID: {a.representante_id}\n")


if __name__ == "__main__":
    email = "esteban.leon@unl.edu.ec"
    if len(sys.argv) > 1:
        email = sys.argv[1]
    asyncio.run(debug_athletes(email))
