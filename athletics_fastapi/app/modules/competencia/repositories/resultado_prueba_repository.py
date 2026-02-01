from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.modules.competencia.domain.models.resultado_prueba_model import ResultadoPrueba

class ResultadoPruebaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, resultado: ResultadoPrueba) -> ResultadoPrueba:
        self.session.add(resultado)
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def get_all(self) -> List[ResultadoPrueba]:
        from sqlalchemy.orm import selectinload
        from app.modules.atleta.domain.models.atleta_model import Atleta
        from app.modules.competencia.domain.models.prueba_model import Prueba
        
        stmt = (
            select(ResultadoPrueba)
            .options(
                selectinload(ResultadoPrueba.atleta).selectinload(Atleta.user),
                selectinload(ResultadoPrueba.prueba)
            )
            .order_by(ResultadoPrueba.fecha_creacion.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_external_id(self, external_id: UUID) -> Optional[ResultadoPrueba]:
        stmt = select(ResultadoPrueba).where(ResultadoPrueba.external_id == external_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, resultado: ResultadoPrueba) -> ResultadoPrueba:
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def delete(self, resultado: ResultadoPrueba):
        await self.session.delete(resultado)
        await self.session.commit()
