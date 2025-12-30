"""Servicio de negocio para Resultado Competencia."""
from uuid import UUID
from fastapi import HTTPException, status
from datetime import date
from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia
from app.modules.competencia.domain.schemas.competencia_schema import (
    ResultadoCompetenciaCreate,
    ResultadoCompetenciaUpdate,
)
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository
from app.modules.competencia.repositories.competencia_repository import CompetenciaRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from sqlalchemy.ext.asyncio import AsyncSession


class ResultadoCompetenciaService:
    """Servicio para manejar la lógica de negocio de Resultado Competencia."""

    def __init__(
        self,
        repo: ResultadoCompetenciaRepository,
        competencia_repo: CompetenciaRepository,
        atleta_repo: AtletaRepository,
        prueba_repo: PruebaRepository,
    ):
        self.repo = repo
        self.competencia_repo = competencia_repo
        self.atleta_repo = atleta_repo
        self.prueba_repo = prueba_repo

    async def create(self, data: ResultadoCompetenciaCreate, entrenador_id: int) -> ResultadoCompetencia:
        """Crear un nuevo resultado."""
        # Validar que existan competencia, atleta y prueba
        competencia = await self.competencia_repo.get_by_id(data.competencia_id)
        if not competencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Competencia no encontrada",
            )

        atleta = await self.atleta_repo.get_by_id(data.atleta_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado",
            )

        prueba = await self.prueba_repo.get_by_id(data.prueba_id)
        if not prueba:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prueba no encontrada",
            )

        resultado = ResultadoCompetencia(
            **data.model_dump(),
            entrenador_id=entrenador_id,
            fecha_registro=date.today(),
        )
        return await self.repo.create(resultado)

    async def get_by_id(self, id: int) -> ResultadoCompetencia:
        """Obtener resultado por ID."""
        resultado = await self.repo.get_by_id(id)
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resultado no encontrado",
            )
        return resultado

    async def get_by_external_id(self, external_id: UUID) -> ResultadoCompetencia:
        """Obtener resultado por external_id."""
        resultado = await self.repo.get_by_external_id(external_id)
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resultado no encontrado",
            )
        return resultado

    async def get_by_competencia(self, competencia_id: int):
        """Obtener resultados de una competencia."""
        competencia = await self.competencia_repo.get_by_id(competencia_id)
        if not competencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Competencia no encontrada",
            )
        return await self.repo.get_by_competencia(competencia_id)

    async def get_by_competencia_external_id(self, external_id: UUID):
        """Obtener resultados de una competencia por su external_id."""
        competencia = await self.competencia_repo.get_by_external_id(external_id)
        if not competencia:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Competencia no encontrada",
            )
        return await self.repo.get_by_competencia(competencia.id)

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: int = None):
        """Obtener todos los resultados."""
        return await self.repo.get_all(incluir_inactivos, entrenador_id)

    async def update(self, external_id: UUID, data: ResultadoCompetenciaUpdate) -> ResultadoCompetencia:
        """Actualizar un resultado."""
        resultado = await self.get_by_external_id(external_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(resultado, field, value)

        return await self.repo.update(resultado)

    async def count(self) -> int:
        """Contar total de resultados."""
        return await self.repo.count()
