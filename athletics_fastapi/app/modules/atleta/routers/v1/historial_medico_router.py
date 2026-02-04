from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
    HistorialMedicoRead
)
from app.modules.atleta.services.historial_medico_service import HistorialMedicoService

router = APIRouter()


@router.post("/", response_model=HistorialMedicoRead, status_code=status.HTTP_201_CREATED)
async def create_historial(
    data: HistorialMedicoCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Crea el historial médico para el atleta actualmente autenticado.
    
    Verifica que el usuario tenga rol ATLETA.
    """
    if current_user.profile.role != RoleEnum.ATLETA:
        raise HTTPException(status_code=403, detail="Solo ATLETAS")

    service = HistorialMedicoService(db)
    return await service.create(data, current_user.id)


@router.get("/me", response_model=HistorialMedicoRead | None)
async def get_my_historial(
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Obtiene el historial médico del atleta autenticado.
    Si el usuario no es ATLETA, retorna None en lugar de error.
    """
    if current_user.profile.role != RoleEnum.ATLETA:
        return None

    service = HistorialMedicoService(db)
    # Handle the case where the athlete has no history yet (service might raise 404)
    # Ideally, we should create one or return None if not created yet?
    # But for now, let's just fix the crash for non-athletes.
    try:
        return await service.get_by_user(current_user.id)
    except HTTPException as e:
        if e.status_code == 404:
             return None # Return None if no history found even for athlete
        raise e


@router.get("/{external_id}", response_model=HistorialMedicoRead)
async def get_historial(external_id: UUID, db: AsyncSession = Depends(get_session)):
    """
    Obtiene un historial médico por su ID externo (UUID).
    """
    service = HistorialMedicoService(db)
    return await service.get(external_id)


@router.get("/", response_model=list[HistorialMedicoRead])
async def list_historiales(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_session)
):
    """
    Lista todos los historiales médicos registrados (Paginado).
    """
    service = HistorialMedicoService(db)
    return await service.get_all(skip, limit)


@router.put("/{external_id}", response_model=HistorialMedicoRead)
async def update_historial(
    external_id: UUID,
    data: HistorialMedicoUpdate,
    db: AsyncSession = Depends(get_session)
):
    """
    Actualiza datos del historial médico especificado por su UUID.
    """
    service = HistorialMedicoService(db)
    return await service.update(external_id, data)


@router.get("/user/{user_id}", response_model=HistorialMedicoRead)
async def get_historial_by_user(
    user_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Obtiene el historial médico de un usuario específico (por su ID de perfil).
    
    Restringido a administradores y entrenadores.
    """
    # Verificar permisos: Solo Admin o Entrenador pueden ver historial de otros
    if current_user.profile.role not in [RoleEnum.ADMINISTRADOR, RoleEnum.ENTRENADOR]:
         raise HTTPException(status_code=403, detail="No tienes permisos para ver este historial")

    service = HistorialMedicoService(db)
    return await service.get_by_profile_id(user_id)
