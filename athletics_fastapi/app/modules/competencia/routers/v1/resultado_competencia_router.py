from fastapi import APIRouter, Depends, status, HTTPException
from uuid import UUID
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.competencia.services.resultado_competencia_service import ResultadoCompetenciaService
from app.modules.competencia.domain.schemas.competencia_schema import (
    ResultadoCompetenciaCreate,
    ResultadoCompetenciaUpdate,
    ResultadoCompetenciaRead,
)
from app.modules.competencia.dependencies import get_resultado_competencia_service

router = APIRouter()

@router.post("", response_model=ResultadoCompetenciaRead, status_code=status.HTTP_201_CREATED)
async def crear_resultado(
    data: ResultadoCompetenciaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """
    Registrar un resultado de competencia usando external_id.
    Se reciben UUIDs desde el frontend y el Service los convierte a IDs internos.
    """
    return await service.create(data, current_user.id)


@router.get("", response_model=list[ResultadoCompetenciaRead])
async def listar_resultados(
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
    incluir_inactivos: bool = True,
):
    """Listar todos los resultados del entrenador (filtra por estado y entrenador)."""
    return await service.get_all(incluir_inactivos, current_user.id)


@router.get("/competencia/{external_id}", response_model=list[ResultadoCompetenciaRead])
async def listar_resultados_por_competencia(
    external_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Listar resultados de una competencia usando su external_id."""
    return await service.get_by_competencia_external_id(external_id)


@router.get("/{external_id}", response_model=ResultadoCompetenciaRead)
async def obtener_resultado(
    external_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Obtener detalle de un resultado usando su external_id."""
    return await service.get_by_external_id(external_id)


@router.put("/{external_id}", response_model=ResultadoCompetenciaRead)
async def actualizar_resultado(
    external_id: UUID,
    data: ResultadoCompetenciaUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """
    Actualizar un resultado usando su external_id.
    Solo puede actualizarlo el entrenador propietario o un administrador.
    """
    resultado = await service.get_by_external_id(external_id)
    if resultado.entrenador_id != current_user.id and current_user.profile.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    return await service.update(external_id, data)
