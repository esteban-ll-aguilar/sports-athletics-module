from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_auth import UserCreate
from app.modules.representante.services.representante_service import RepresentanteService

representante_router = APIRouter()

def get_representante_service(session: AsyncSession = Depends(get_session)):
    return RepresentanteService(session)

@representante_router.post("/athletes", status_code=status.HTTP_201_CREATED)
async def register_athlete_child(
    child_data: UserCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Registra un atleta (hijo) vinculado al representante autenticado.
    """
    # El service se encarga de validar que current_user sea representante
    return await service.register_child_athlete(current_user.id, child_data)

@representante_router.get("/athletes", status_code=status.HTTP_200_OK)
async def get_my_athletes(
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Lista los atletas asociados al representante autenticado.
    """
    return await service.get_representante_athletes(current_user.id)
