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
    if current_user.profile.role != RoleEnum.ATLETA:
        raise HTTPException(status_code=403, detail="Solo ATLETAS")

    service = HistorialMedicoService(db)
    return await service.create(data, current_user.id)


@router.get("/me", response_model=HistorialMedicoRead)
async def get_my_historial(
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    service = HistorialMedicoService(db)
    return await service.get_by_user(current_user.id)


@router.get("/{external_id}", response_model=HistorialMedicoRead)
async def get_historial(external_id: UUID, db: AsyncSession = Depends(get_session)):
    service = HistorialMedicoService(db)
    return await service.get(external_id)


@router.get("/", response_model=list[HistorialMedicoRead])
async def list_historiales(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_session)
):
    service = HistorialMedicoService(db)
    return await service.get_all(skip, limit)


@router.put("/{external_id}", response_model=HistorialMedicoRead)
async def update_historial(
    external_id: UUID,
    data: HistorialMedicoUpdate,
    db: AsyncSession = Depends(get_session)
):
    service = HistorialMedicoService(db)
    return await service.update(external_id, data)
