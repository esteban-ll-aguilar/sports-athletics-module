from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
    AtletaRead,
)
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository

router = APIRouter()


# Dependency
def get_atleta_service(
    session: AsyncSession = Depends(get_session),
) -> AtletaService:
    atleta_repo = AtletaRepository(session)
    auth_repo = AuthUsersRepository(session)
    resultado_repo = ResultadoCompetenciaRepository(session)
    return AtletaService(
        atleta_repo=atleta_repo,
        auth_repo=auth_repo,
        resultado_repo=resultado_repo,
    )


@router.post(
    "/",
    response_model=AtletaRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_atleta(
    data: AtletaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
): 
    """
    Endpoint para crear un nuevo perfil de atleta.
    
    Requiere que el usuario autenticado tenga el rol ATLETA.
    """ 
    return await service.create(data, current_user.id)


@router.get(
    "/me",
    response_model=AtletaRead,
)
async def get_my_atleta(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Obtiene los datos del perfil de atleta del usuario actual.
    """
    return await service.get_me(current_user.id)


@router.get(
    "/historial",
)
async def get_my_historial(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Obtiene el historial de competencias del atleta autenticado.
    Retorna una lista de resultados donde participó el atleta.
    """
    return await service.get_historial(current_user.id)


@router.get(
    "/estadisticas",
)
async def get_my_estadisticas(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Calcula y retorna estadísticas del atleta autenticado.
    Incluye conteo de medallas, total de competencias y años de experiencia.
    """
    return await service.get_estadisticas(current_user.id)


@router.get(
    "/{atleta_id}",
    response_model=AtletaRead,
)
async def get_atleta(
    atleta_id: int,
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Obtiene los datos públicos de un atleta específico por su ID.
    """
    return await service.get_by_id(atleta_id)


@router.get(
    "/",
    response_model=list[AtletaRead],
)
async def list_atletas(
    skip: int = 0,
    limit: int = 100,
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Lista todos los atletas registrados en el sistema, con paginación.
    """
    return await service.get_all(skip, limit)


@router.put(
    "/{atleta_id}",
    response_model=AtletaRead,
)
async def update_atleta(
    atleta_id: int,
    data: AtletaUpdate,
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Actualiza los datos de un atleta existente.
    """
    return await service.update(atleta_id, data)


@router.delete(
    "/{atleta_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_atleta(
    atleta_id: int,
    service: AtletaService = Depends(get_atleta_service),
):
    """
    Elimina físicamente un perfil de atleta.
    """
    await service.delete(atleta_id)
