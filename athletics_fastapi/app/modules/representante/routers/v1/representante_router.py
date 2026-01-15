from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema, UserResponseSchema, UserUpdateSchema
from app.modules.atleta.domain.schemas.atleta_schema import AtletaRead
from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.representante.dependencies import get_representante_service

representante_router = APIRouter()

@representante_router.post("/athletes", response_model=AtletaRead, status_code=status.HTTP_201_CREATED)
async def register_athlete_child(
    child_data: UserCreateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Registra un atleta (hijo) vinculado al representante autenticado.
    """
    # El service se encarga de validar que current_user sea representante
    return await service.register_child_athlete(current_user.id, child_data)

@representante_router.put("/athletes/{atleta_id}", response_model=AtletaRead, status_code=status.HTTP_200_OK)
async def update_athlete_child(
    atleta_id: int,
    update_data: UserUpdateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Actualiza la información de un atleta (hijo) vinculado al representante.
    """
    return await service.update_child_athlete(current_user.id, atleta_id, update_data)

@representante_router.get("/athletes", response_model=list[AtletaRead], status_code=status.HTTP_200_OK)
async def get_my_athletes(
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Lista los atletas asociados al representante autenticado.
    """
    return await service.get_representante_athletes(current_user.id)
    
    return await service.get_representante_athletes(current_user.id)
    
@representante_router.get("/athletes/{atleta_id}", response_model=AtletaRead, status_code=status.HTTP_200_OK)
async def get_athlete_detail(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Obtiene el detalle de un atleta representado específico via ID.
    """
    # Reutilizamos validación de servicio que retorna el Atleta ORM
    # El schema AtletaRead se encarga de serializarlo.
    return await service._validate_relation(current_user.id, atleta_id)

@representante_router.get("/athletes/{atleta_id}/historial")
async def get_athlete_historial(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Obtiene el historial de un atleta representado específico.
    """
    return await service.get_athlete_historial(current_user.id, atleta_id)

@representante_router.get("/athletes/{atleta_id}/estadisticas")
async def get_athlete_stats(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """
    Obtiene las estadísticas de un atleta representado específico.
    """
    return await service.get_athlete_stats(current_user.id, atleta_id)
