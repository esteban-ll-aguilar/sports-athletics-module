"""
Atleta Test Router - No Rate Limiting
Provides atleta and historial medico endpoints without rate limiting for testing.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
    AtletaRead,
)
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
    HistorialMedicoRead
)
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.services.historial_medico_service import HistorialMedicoService
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository

router = APIRouter(prefix="/atleta")


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


# ======================================================
# ATLETA ENDPOINTS
# ======================================================

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
    """TEST: Create atleta profile"""
    return await service.create(data, current_user.id)


@router.get("/me", response_model=AtletaRead)
async def get_my_atleta(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Get current athlete profile"""
    return await service.get_me(current_user.id)


@router.get("/historial")
async def get_my_historial(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Get athlete competition history"""
    return await service.get_historial(current_user.id)


@router.get("/estadisticas")
async def get_my_estadisticas(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Get athlete statistics"""
    return await service.get_estadisticas(current_user.id)


@router.get("/{atleta_id}", response_model=AtletaRead)
async def get_atleta(
    atleta_id: int,
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Get athlete by ID"""
    return await service.get_by_id(atleta_id)


@router.get("/", response_model=list[AtletaRead])
async def list_atletas(
    skip: int = 0,
    limit: int = 100,
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: List all athletes"""
    return await service.get_all(skip, limit)


@router.put("/{atleta_id}", response_model=AtletaRead)
async def update_atleta(
    atleta_id: int,
    data: AtletaUpdate,
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Update athlete"""
    return await service.update(atleta_id, data)


@router.delete("/{atleta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_atleta(
    atleta_id: int,
    service: AtletaService = Depends(get_atleta_service),
):
    """TEST: Delete athlete"""
    await service.delete(atleta_id)


# ======================================================
# HISTORIAL MEDICO ENDPOINTS
# ======================================================

@router.post("/historial-medico/", response_model=HistorialMedicoRead, status_code=status.HTTP_201_CREATED)
async def create_historial(
    data: HistorialMedicoCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """TEST: Create medical history"""
    if current_user.profile.role != RoleEnum.ATLETA:
        raise HTTPException(status_code=403, detail="Solo ATLETAS")

    service = HistorialMedicoService(db)
    return await service.create(data, current_user.id)


@router.get("/historial-medico/me", response_model=HistorialMedicoRead | None)
async def get_my_historial_medico(
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """TEST: Get my medical history"""
    if current_user.profile.role != RoleEnum.ATLETA:
        return None

    service = HistorialMedicoService(db)
    try:
        return await service.get_by_user(current_user.id)
    except HTTPException as e:
        if e.status_code == 404:
             return None
        raise e


@router.get("/historial-medico/{external_id}", response_model=HistorialMedicoRead)
async def get_historial_medico(external_id: UUID, db: AsyncSession = Depends(get_session)):
    """TEST: Get medical history by UUID"""
    service = HistorialMedicoService(db)
    return await service.get(external_id)


@router.get("/historial-medico/", response_model=list[HistorialMedicoRead])
async def list_historiales(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_session)
):
    """TEST: List all medical histories"""
    service = HistorialMedicoService(db)
    return await service.get_all(skip, limit)


@router.put("/historial-medico/{external_id}", response_model=HistorialMedicoRead)
async def update_historial_medico(
    external_id: UUID,
    data: HistorialMedicoUpdate,
    db: AsyncSession = Depends(get_session)
):
    """TEST: Update medical history"""
    service = HistorialMedicoService(db)
    return await service.update(external_id, data)


@router.get("/historial-medico/user/{user_id}", response_model=HistorialMedicoRead)
async def get_historial_by_user(
    user_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """TEST: Get medical history by user ID"""
    if current_user.profile.role not in [RoleEnum.ADMINISTRADOR, RoleEnum.ENTRENADOR]:
         raise HTTPException(status_code=403, detail="No tienes permisos")

    service = HistorialMedicoService(db)
    return await service.get_by_profile_id(user_id)
