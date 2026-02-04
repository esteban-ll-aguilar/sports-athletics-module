from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional

from app.modules.competencia.domain.models.resultado_prueba_model import ResultadoPrueba

class ResultadoPruebaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, resultado: ResultadoPrueba) -> ResultadoPrueba:
        """Crea un nuevo resultado de prueba y lo guarda en la base de datos."""
        # Agrega el resultado a la sesión y lo guarda en la base de datos
        self.session.add(resultado)
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def get_all(self) -> List[ResultadoPrueba]:
        """Obtiene todos los resultados de prueba, ordenados por fecha de creación descendente."""
        # Realiza una consulta con carga anticipada de relaciones y ordena por fecha de creación
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
        """Obtiene un resultado de prueba por su external_id."""
        # Busca un resultado de prueba utilizando su external_id
        stmt = select(ResultadoPrueba).where(ResultadoPrueba.external_id == external_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, resultado: ResultadoPrueba) -> ResultadoPrueba:
        """Actualiza un resultado de prueba existente en la base de datos."""
        # Confirma los cambios realizados en el resultado y actualiza su estado
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def delete(self, resultado: ResultadoPrueba):
        """Elimina un resultado de prueba de la base de datos."""
        # Elimina el resultado de la sesión y confirma los cambios
        await self.session.delete(resultado)
        await self.session.commit()
