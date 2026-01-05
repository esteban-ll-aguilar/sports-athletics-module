from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.asistencia_model import Asistencia

class AsistenciaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, asistencia: Asistencia) -> Asistencia:
        self.session.add(asistencia)
        await self.session.commit()
        await self.session.refresh(asistencia)
        return asistencia

    async def get_by_registro_asistencias(self, registro_asistencias_id: int) -> List[Asistencia]:
        result = await self.session.execute(
            select(Asistencia).where(Asistencia.registro_asistencias_id == registro_asistencias_id)
        )
        return result.scalars().all()
        
    async def delete(self, asistencia: Asistencia) -> None:
        await self.session.delete(asistencia)
        await self.session.commit()
