import asyncio
import sys
from sqlalchemy import select
from app.core.db.database import _db
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.atleta.domain.models.atleta_model import Atleta 
from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico

async def fix_representante(email: str):
    print(f"Fixing representative for email: {email}")

    # Initialize DB engine
    engine = _db.get_engine()
    
    async with _db.get_session_factory()() as session:
        # Find user
        result = await session.execute(select(AuthUserModel).where(AuthUserModel.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print("User not found!")
            return
            
        print(f"Found user: {user.id} - {user.email} - Role: {user.role}")
        
        # Check if Representante exists
        result = await session.execute(select(Representante).where(Representante.user_id == user.id))
        representante = result.scalar_one_or_none()
        
        if representante:
            print("Representante record ALREADY EXISTS.")
        else:
            print("Representante record MISSING. Creating it now...")
            new_rep = Representante(user_id=user.id)
            session.add(new_rep)
            await session.commit()
            print("Representante record CREATED successfully.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_representante.py <email>")
        # Default to the email seen in logs if none provided
        email = "esteban.leon@unl.edu.ec"
    else:
        email = sys.argv[1]
        
    asyncio.run(fix_representante(email))
