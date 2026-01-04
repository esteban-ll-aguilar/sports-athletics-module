"""Router para Competencia."""
from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.competencia.services.competencia_service import CompetenciaService
from app.modules.competencia.domain.schemas.competencia_schema import (
    CompetenciaCreate,
    CompetenciaUpdate,
    CompetenciaRead,
)
from app.modules.competencia.dependencies import get_competencia_service
from app.modules.auth.domain.enums.role_enum import RoleEnum

router = APIRouter()


@router.post("", response_model=CompetenciaRead, status_code=status.HTTP_201_CREATED)
async def crear_competencia(
    data: CompetenciaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Crear una nueva competencia."""
    return await service.create(data, current_user.id)


@router.get("", response_model=list[CompetenciaRead])
async def listar_competencias(
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
    incluir_inactivos: bool = True,
):
    """Listar todas las competencias del entrenador."""
    return await service.get_all(incluir_inactivos, current_user.id)


@router.get("/{external_id}", response_model=CompetenciaRead)
async def obtener_competencia(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Obtener detalles de una competencia."""
    return await service.get_by_external_id(external_id)

from app.modules.auth.domain.enums.role_enum import RoleEnum

@router.put("/{external_id}", response_model=CompetenciaRead)
async def actualizar_competencia(
    external_id: UUID,
    data: CompetenciaUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Actualizar una competencia (solo rol ENTRENADOR)."""

    if current_user.role != RoleEnum.ENTRENADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los entrenadores pueden modificar competencias"
        )

    return await service.update(external_id, data)

