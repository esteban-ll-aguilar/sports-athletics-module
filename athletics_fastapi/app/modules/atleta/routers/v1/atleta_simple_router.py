from fastapi import APIRouter, Depends
from typing import List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository
from app.modules.auth.dependencies import get_current_user

router = APIRouter(
    prefix="",
    tags=["Atleta"]
)

async def get_atleta_service(session: AsyncSession = Depends(get_session)) -> AtletaService:
    atleta_repo = AtletaRepository(session)
    auth_repo = AuthUsersRepository(session)
    resultado_repo = ResultadoCompetenciaRepository(session)
    return AtletaService(atleta_repo, auth_repo, resultado_repo)

from app.modules.atleta.domain.schemas.atleta_simple_schema import AtletaSimpleResponse

@router.get("/", response_model=List[AtletaSimpleResponse])
async def list_atletas(
    service: AtletaService = Depends(get_atleta_service),
    current_user = Depends(get_current_user)
):
    """
    Lista todos los atletas registrados.
    """
    return await service.get_all()
