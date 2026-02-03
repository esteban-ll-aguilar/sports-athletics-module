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
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()

@router.post("", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_resultado(
    data: ResultadoCompetenciaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """
    Registrar un resultado de competencia usando external_id.
    Se reciben UUIDs desde el frontend y el Service los convierte a IDs internos.
    """
    try:
        nuevo_resultado = await service.create(data, current_user.profile.id)
        return ResponseHandler.success_response(
            summary="Resultado de competencia creado con exito",
            message="Resultado de competencia creado con exito",
            data=ResultadoCompetenciaRead.model_validate(nuevo_resultado).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear resultado de competencia",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


from app.modules.auth.domain.enums import RoleEnum

@router.get("", response_model=BaseResponse)
async def listar_resultados(
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
    incluir_inactivos: bool = True,
):
    """Listar todos los resultados. Administradores ven todo, Entrenadores tambien."""
    try:
        entrenador_id = current_user.profile.id
        
        # Obtener rol como string de forma segura
        role = current_user.profile.role
        role_str = role.value if hasattr(role, 'value') else str(role)

        # Entrenadores, Admins y Pasantes ven todo (o filtrado por entrenador)
        if role_str == "ATLETA":
            resultados = await service.get_by_user_id(current_user.profile.id)
        else:
            if role_str in ["ADMINISTRADOR", "ENTRENADOR", "PASANTE"]:
                 entrenador_id = None
            
            resultados = await service.get_all(incluir_inactivos, entrenador_id)
        if not resultados:
             return ResponseHandler.success_response(
                summary="No hay resultados de competencia registrados",
                message="No se encontraron resultados de competencia",
                data={"items": []}
            )
        
        items = [ResultadoCompetenciaRead.model_validate(r).model_dump() for r in resultados]
        
        return ResponseHandler.success_response(
            summary="Lista de resultados de competencia obtenida",
            message="Resultados de competencia encontrados",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar resultados de competencia",
            message=str(e)
        )


@router.get("/competencia/{external_id}", response_model=BaseResponse)
async def listar_resultados_por_competencia(
    external_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Listar resultados de una competencia usando su external_id."""
    try:
        resultados = await service.get_by_competencia_external_id(external_id)
        if not resultados:
              return ResponseHandler.success_response(
                summary="No hay resultados para esta competencia",
                message="No se encontraron resultados",
                data={"items": []}
            )

        items = [ResultadoCompetenciaRead.model_validate(r).model_dump() for r in resultados]
        
        return ResponseHandler.success_response(
            summary="Resultados por competencia obtenidos",
            message="Resultados encontrados",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar resultados por competencia",
            message=str(e)
        )


@router.get("/{external_id}", response_model=BaseResponse)
async def obtener_resultado(
    external_id: UUID,
    service: ResultadoCompetenciaService = Depends(get_resultado_competencia_service),
):
    """Obtener detalle de un resultado usando su external_id."""
    try:
        resultado = await service.get_by_external_id(external_id)
        if not resultado:
            return ResponseHandler.not_found_response(
                entity="Resultado de competencia",
                message="Resultado no encontrado"
            )
        return ResponseHandler.success_response(
            summary="Resultado encontrado",
            message="Detalle de resultado obtenido",
            data=ResultadoCompetenciaRead.model_validate(resultado).model_dump()
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al obtener resultado",
            message=str(e)
        )


@router.put("/{external_id}", response_model=BaseResponse)
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
    try:
        resultado = await service.get_by_external_id(external_id)
        if not resultado:
             return ResponseHandler.not_found_response(
                entity="Resultado de competencia",
                message="Resultado no encontrado para actualización"
            )

        if resultado.entrenador_id != current_user.profile.id and current_user.profile.role not in ["ADMINISTRADOR", "PASANTE"]:
             return ResponseHandler.forbidden_response(
                 message="No tienes permiso para actualizar este resultado"
             )

        resultado_actualizado = await service.update(external_id, data)
        return ResponseHandler.success_response(
            summary="Resultado actualizado con exito",
            message="Resultado actualizado correctamente",
            data=ResultadoCompetenciaRead.model_validate(resultado_actualizado).model_dump()
        )
    except HTTPException as e:
        return ResponseHandler.error_response(
            summary="Error al actualizar resultado",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e)
        )
