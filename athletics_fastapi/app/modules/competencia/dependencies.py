# app/api/dependencies.py

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.enums.role_enum import RoleEnum

# Repositorios y servicios
from app.modules.competencia.repositories.baremo_repository import BaremoRepository
from app.modules.competencia.services.baremo_service import BaremoService

from app.modules.competencia.repositories.tipo_disciplina_repository import TipoDisciplinaRepository
from app.modules.competencia.services.tipo_disciplina_service import TipoDisciplinaService

from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.services.prueba_service import PruebaService

from app.modules.competencia.repositories.competencia_repository import CompetenciaRepository
from app.modules.competencia.services.competencia_service import CompetenciaService

from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository
from app.modules.competencia.services.resultado_competencia_service import ResultadoCompetenciaService
from app.modules.atleta.repositories.atleta_repository import AtletaRepository

# ============================
# Servicio Baremo (CRUD)
# ============================
async def get_baremo_service(
    session: AsyncSession = Depends(get_session)
) -> BaremoService:
    repo = BaremoRepository(session)
    return BaremoService(repo)


# ============================
# Servicio TipoDisciplina (CRUD)
# ============================
async def get_tipo_disciplina_service(
    session: AsyncSession = Depends(get_session)
) -> TipoDisciplinaService:
    repo = TipoDisciplinaRepository(session)
    return TipoDisciplinaService(repo)


# ============================
# Servicio Prueba (CRUD)
# ============================
async def get_prueba_service(
    session: AsyncSession = Depends(get_session)
) -> PruebaService:
    repo = PruebaRepository(session)
    return PruebaService(repo)


# ============================
# Servicio Competencia (CRUD)
# ============================
async def get_competencia_service(
    session: AsyncSession = Depends(get_session)
) -> CompetenciaService:
    repo = CompetenciaRepository(session)
    return CompetenciaService(repo)


# ============================
# Servicio Resultado Competencia (CRUD)
# ============================
async def get_resultado_competencia_service(
    session: AsyncSession = Depends(get_session)
) -> ResultadoCompetenciaService:
    resultado_repo = ResultadoCompetenciaRepository(session)
    competencia_repo = CompetenciaRepository(session)
    atleta_repo = AtletaRepository(session)
    prueba_repo = PruebaRepository(session)
    return ResultadoCompetenciaService(
        resultado_repo,
        competencia_repo,
        atleta_repo,
        prueba_repo
    )


# ============================
# Seguridad: Admin o Entrenador
# ============================
async def get_current_admin_or_entrenador(
    current_user = Depends(get_current_user)
):
    if current_user.role not in (
        RoleEnum.ADMINISTRADOR,
        RoleEnum.ENTRENADOR
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para esta acción"
        )
    return current_user
