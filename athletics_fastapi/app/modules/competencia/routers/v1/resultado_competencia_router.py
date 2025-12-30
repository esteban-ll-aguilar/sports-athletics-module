"""Router para Resultado Competencia."""
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
    """Registrar un resultado de competencia."""
    return await service.create(data, current_user.id)


@router.get("", response_model=list[ResultadoCompetenciaRead])
async def listar_resultados(
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
    incluir_inactivos: bool = True,
):
    """Listar todos los resultados del entrenador."""
    return await service.get_all(incluir_inactivos, current_user.id)


@router.get("/competencia/{external_id}", response_model=list[ResultadoCompetenciaRead])
async def listar_resultados_por_competencia(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Listar todos los resultados de una competencia."""
    return await service.get_by_competencia_external_id(external_id)


@router.get("/{external_id}", response_model=ResultadoCompetenciaRead)
async def obtener_resultado(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Obtener detalles de un resultado."""
    return await service.get_by_external_id(external_id)


@router.put("/{external_id}", response_model=ResultadoCompetenciaRead)
async def actualizar_resultado(
    external_id: UUID,
    data: ResultadoCompetenciaUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Actualizar un resultado."""
    resultado = await service.get_by_external_id(external_id)
    if resultado.entrenador_id != current_user.id and current_user.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    return await service.update(resultado.id, data)

