"""
Repositorio para Resultado Competencia.

Este módulo contiene la clase `ResultadoCompetenciaRepository`, que se encarga de realizar las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para el modelo `ResultadoCompetencia`.

Clases:
    - ResultadoCompetenciaRepository: Clase principal para manejar las operaciones de base de datos relacionadas con el modelo `ResultadoCompetencia`.

Métodos:
    - create(resultado: ResultadoCompetencia) -> ResultadoCompetencia: Crea un nuevo resultado en la base de datos.
    - get_by_id(id: int) -> Optional[ResultadoCompetencia]: Obtiene un resultado por su ID interno.
    - get_by_external_id(external_id: UUID) -> Optional[ResultadoCompetencia]: Obtiene un resultado por su `external_id`.
    - get_by_competencia(competencia_id: int) -> List[ResultadoCompetencia]: Obtiene los resultados activos de una competencia específica.
    - get_by_atleta_and_competencia(atleta_id: int, competencia_id: int) -> List[ResultadoCompetencia]: Obtiene los resultados de un atleta en una competencia específica.
    - get_all(incluir_inactivos: bool = True, entrenador_id: Optional[int] = None) -> List[ResultadoCompetencia]: Obtiene todos los resultados, con opciones para filtrar por estado y entrenador.
    - update(resultado: ResultadoCompetencia) -> ResultadoCompetencia: Actualiza un resultado existente.
    - delete(id: int) -> bool: Elimina un resultado por su ID interno.
    - count() -> int: Cuenta el número total de resultados en la base de datos.
    - get_by_atleta(atleta_id: int) -> List[ResultadoCompetencia]: Obtiene todos los resultados de un atleta, ordenados por fecha de registro descendente.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List, Optional
from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia
from app.modules.competencia.domain.models.prueba_model import Prueba


class ResultadoCompetenciaRepository:
    """Repositorio para manejar operaciones CRUD de Resultado Competencia."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, resultado: ResultadoCompetencia) -> ResultadoCompetencia:
        """Crear un nuevo resultado."""
        self.session.add(resultado)
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def get_by_id(self, id: int) -> Optional[ResultadoCompetencia]:
        """Obtener resultado por ID interno (int)."""
        result = await self.session.execute(
            select(ResultadoCompetencia).where(ResultadoCompetencia.id == id)
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: UUID) -> Optional[ResultadoCompetencia]:
        """Obtener resultado por external_id (UUID)."""
        result = await self.session.execute(
            select(ResultadoCompetencia).where(ResultadoCompetencia.external_id == external_id)
        )
        return result.scalars().first()

    async def get_by_competencia(self, competencia_id: int) -> List[ResultadoCompetencia]:
        """Obtener resultados activos de una competencia usando ID interno."""
        result = await self.session.execute(
            select(ResultadoCompetencia)
            .where(ResultadoCompetencia.competencia_id == competencia_id)
            .where(ResultadoCompetencia.estado == True)
        )
        return result.scalars().all() or []

    async def get_by_atleta_and_competencia(self, atleta_id: int, competencia_id: int) -> List[ResultadoCompetencia]:
        """Obtener resultados de un atleta en una competencia usando IDs internos."""
        result = await self.session.execute(
            select(ResultadoCompetencia).where(
                (ResultadoCompetencia.atleta_id == atleta_id) &
                (ResultadoCompetencia.competencia_id == competencia_id)
            )
        )
        return result.scalars().all() or []

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: Optional[int] = None) -> List[ResultadoCompetencia]:
        """Obtener todos los resultados, filtrando por estado y entrenador si aplica."""
        query = select(ResultadoCompetencia).options(
            selectinload(ResultadoCompetencia.competencia),
            selectinload(ResultadoCompetencia.prueba),
            selectinload(ResultadoCompetencia.atleta),
            selectinload(ResultadoCompetencia.entrenador)
        )
        if not incluir_inactivos:
            query = query.where(ResultadoCompetencia.estado == True)
        if entrenador_id is not None:
            query = query.where(ResultadoCompetencia.entrenador_id == entrenador_id)
        result = await self.session.execute(query)
        return result.scalars().all() or []

    async def update(self, resultado: ResultadoCompetencia) -> ResultadoCompetencia:
        """Actualizar un resultado."""
        await self.session.merge(resultado)
        await self.session.commit()
        await self.session.refresh(resultado)
        return resultado

    async def delete(self, id: int) -> bool:
        """Eliminar un resultado usando ID interno."""
        resultado = await self.get_by_id(id)
        if resultado:
            await self.session.delete(resultado)
            await self.session.commit()
            return True
        return False

    async def count(self) -> int:
        """Contar total de resultados."""
        result = await self.session.execute(select(func.count(ResultadoCompetencia.id)))
        return result.scalar() or 0

    async def get_by_atleta(self, atleta_id: int) -> List[ResultadoCompetencia]:
        """Obtener todos los resultados de un atleta (ordenados por fecha descendente)."""
        result = await self.session.execute(
            select(ResultadoCompetencia)
            .where(ResultadoCompetencia.atleta_id == atleta_id)
            .where(ResultadoCompetencia.estado == True)
            .order_by(ResultadoCompetencia.fecha_registro.desc())
            .options(
                selectinload(ResultadoCompetencia.competencia),
                selectinload(ResultadoCompetencia.prueba),
                selectinload(ResultadoCompetencia.atleta),
                selectinload(ResultadoCompetencia.entrenador)
            )
        )
        return result.scalars().all() or []
