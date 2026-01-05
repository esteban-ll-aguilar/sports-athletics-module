"""Servicio de negocio para Competencia."""
from uuid import UUID
from fastapi import HTTPException, status
from app.modules.competencia.domain.models.competencia_model import Competencia
from app.modules.competencia.domain.schemas.competencia_schema import (
    CompetenciaCreate,
    CompetenciaUpdate,
)
from app.modules.competencia.repositories.competencia_repository import CompetenciaRepository


class CompetenciaService:
    """Servicio para manejar la lógica de negocio de Competencia."""

    def __init__(self, repo: CompetenciaRepository):
        self.repo = repo

    async def create(self, data: CompetenciaCreate, entrenador_id: int) -> Competencia:
        """Crear una nueva competencia."""
        competencia = Competencia(
            **data.model_dump(),
            entrenador_id=entrenador_id,
        )
        return await self.repo.create(competencia)

    async def get_by_id(self, id: int) -> Competencia:
        """Obtener competencia por ID."""
        competencia = await self.repo.get_by_id(id)
        if not competencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Competencia no encontrada",
            )
        return competencia

    async def get_by_external_id(self, external_id: UUID) -> Competencia:
        """Obtener competencia por external_id."""
        competencia = await self.repo.get_by_external_id(external_id)
        if not competencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Competencia no encontrada",
            )
        return competencia

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: int = None):
        """Obtener todas las competencias."""
        return await self.repo.get_all(incluir_inactivos, entrenador_id)

    async def update(self, external_id: UUID, data: CompetenciaUpdate) -> Competencia:
        """Actualizar una competencia."""
        competencia = await self.get_by_external_id(external_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(competencia, field, value)

        return await self.repo.update(competencia)

    async def count(self) -> int:
        """Contar total de competencias."""
        return await self.repo.count()
