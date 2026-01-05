from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
from app.modules.atleta.domain.models.atleta_model import Atleta

class RegistroAsistenciasRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, registro: RegistroAsistencias) -> RegistroAsistencias:
        self.session.add(registro)
        await self.session.commit()
        await self.session.refresh(registro)
        
        # Reload with relationships to satisfy Pydantic schema
        from sqlalchemy.orm import selectinload
        try:
             result = await self.session.execute(
                select(RegistroAsistencias)
                .where(RegistroAsistencias.id == registro.id)
                .options(
                    selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user),
                    selectinload(RegistroAsistencias.asistencias)
                )
             )
             return result.scalars().first()
        except:
             return registro

    async def get_by_horario(self, horario_id: int) -> List[RegistroAsistencias]:
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(RegistroAsistencias)
            .where(RegistroAsistencias.horario_id == horario_id)
            .options(
                selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user),
                selectinload(RegistroAsistencias.asistencias)
            )
        )
        return result.scalars().all()

    async def get_by_atleta_and_horario(self, atleta_id: int, horario_id: int) -> Optional[RegistroAsistencias]:
        result = await self.session.execute(
            select(RegistroAsistencias).where(
                RegistroAsistencias.atleta_id == atleta_id,
                RegistroAsistencias.horario_id == horario_id
            )
        )
        return result.scalars().first()

    async def delete(self, registro: RegistroAsistencias) -> None:
        await self.session.delete(registro)
        await self.session.commit()
