from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import date
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
    
    async def get_by_id(self, asistencia_id: int) -> Optional[Asistencia]:
        result = await self.session.execute(
            select(Asistencia).where(Asistencia.id == asistencia_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_registro_and_date(self, registro_id: int, fecha: date) -> Optional[Asistencia]:
        """Obtiene el registro de asistencia para un registro y fecha específicos"""
        result = await self.session.execute(
            select(Asistencia).where(
                Asistencia.registro_asistencias_id == registro_id,
                Asistencia.fecha_asistencia == fecha
            )
        )
        return result.scalar_one_or_none()
    
    async def update(self, asistencia: Asistencia) -> Asistencia:
        """Actualiza un registro de asistencia"""
        await self.session.commit()
        await self.session.refresh(asistencia)
        return asistencia
        
    async def delete(self, asistencia: Asistencia) -> None:
        await self.session.delete(asistencia)
        await self.session.commit()
