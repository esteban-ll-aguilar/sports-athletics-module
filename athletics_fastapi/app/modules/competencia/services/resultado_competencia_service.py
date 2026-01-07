from uuid import UUID
from enum import Enum
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

class UnidadMedida(str, Enum):
    SEGUNDOS = "SEGUNDOS"
    METROS = "METROS"
    PUNTOS = "PUNTOS"

class ResultadoCompetenciaService:
    """Servicio para manejar la lógica de negocio de Resultado Competencia usando external_id."""

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
        """Crear un nuevo resultado usando external_id enviado desde el frontend."""

        # Buscar entidad competencia por external_id
        try:
            competencia_uuid = UUID(str(data.competencia_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="competencia_id debe ser un UUID válido")
        competencia = await self.competencia_repo.get_by_external_id(competencia_uuid)
        if not competencia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competencia no encontrada")

        # Buscar entidad atleta por external_id
        try:
            atleta_uuid = UUID(str(data.atleta_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="atleta_id debe ser un UUID válido")
        atleta = await self.atleta_repo.get_by_external_id(atleta_uuid)
        if not atleta:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Atleta no encontrado")

        # Buscar entidad prueba por external_id
        try:
            prueba_uuid = UUID(str(data.prueba_id))
        except ValueError:
            raise HTTPException(status_code=400, detail="prueba_id debe ser un UUID válido")
        prueba = await self.prueba_repo.get_by_external_id(prueba_uuid)
        if not prueba:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prueba no encontrada")

        # Crear resultado usando IDs internos
        resultado = ResultadoCompetencia(
            competencia_id=competencia.id,
            atleta_id=atleta.id,
            prueba_id=prueba.id,
            resultado=data.resultado,
            unidad_medida=data.unidad_medida,
            posicion_final=data.posicion_final,
            puesto_obtenido=data.puesto_obtenido,
            observaciones=data.observaciones,
            estado=data.estado,
            entrenador_id=entrenador_id,
            fecha_registro=date.today()
        )

        return await self.repo.create(resultado)

    async def get_by_external_id(self, external_id: UUID) -> ResultadoCompetencia:
        resultado = await self.repo.get_by_external_id(external_id)
        if not resultado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resultado no encontrado")
        return resultado

    async def get_by_competencia_external_id(self, external_id: UUID):
        competencia = await self.competencia_repo.get_by_external_id(external_id)
        if not competencia:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Competencia no encontrada")
        return await self.repo.get_by_competencia(competencia.id)

    async def get_all(self, incluir_inactivos: bool = True, entrenador_id: int = None):
        return await self.repo.get_all(incluir_inactivos, entrenador_id)

    async def update(self, external_id: UUID, data: ResultadoCompetenciaUpdate) -> ResultadoCompetencia:
        resultado = await self.get_by_external_id(external_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(resultado, field, value)
        return await self.repo.update(resultado)

    async def count(self) -> int:
        return await self.repo.count()
