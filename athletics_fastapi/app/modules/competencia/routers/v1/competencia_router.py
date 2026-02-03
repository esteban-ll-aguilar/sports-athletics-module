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
from app.public.schemas.base_response import BaseResponse
from app.utils.response_handler import ResponseHandler

router = APIRouter()


@router.post("", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def crear_competencia(
    data: CompetenciaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Crear una nueva competencia. Administradores y Entrenadores."""
    try:
        # Validar permisos - usar .value para comparar enums correctamente
        role = current_user.profile.role
        role_str = role.value if hasattr(role, 'value') else str(role)
        
        if role_str not in ["ADMINISTRADOR", "ENTRENADOR", "PASANTE"]:
             return ResponseHandler.forbidden_response(
                 message="No tienes permisos para crear competencias"
             )

        nueva_competencia = await service.create(data, current_user.profile.id)
        return ResponseHandler.success_response(
            summary="Competencia creado con exito",
            message="Competencia creado con exito",
            data=CompetenciaRead.model_validate(nueva_competencia).model_dump(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al crear competencia",
            message=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("", response_model=BaseResponse)
async def listar_competencias(
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
    incluir_inactivos: bool = True,
):
    """Listar todas las competencias. Administradores ven todas, Entrenadores solo las suyas."""
    try:
        entrenador_id = current_user.id
        
        # Obtener rol como string de forma segura
        role = current_user.profile.role
        role_str = role.value if hasattr(role, 'value') else str(role)
        
        # Si es admin, entrenador o pasante, ve todo (entrenador_id=None)
        # Entrenadores también deben ver todas las competencias para participar.
        if role_str in ["ADMINISTRADOR", "ENTRENADOR", "PASANTE"]:
            entrenador_id = None
            
        competencias = await service.get_all(incluir_inactivos, entrenador_id)
        if not competencias:
             return ResponseHandler.success_response(
                summary="No hay competencias registradas",
                message="No se encontraron competencias",
                data={"items": []}
            )
        
        # Serializar lista de objetos ORM a lista de dicts
        items = [CompetenciaRead.model_validate(c).model_dump() for c in competencias]
        
        return ResponseHandler.success_response(
            summary="Lista de competencias obtenida",
            message="Competencias encontradas",
            data={"items": items}
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error al listar competencias",
            message=str(e)
        )


@router.get("/{external_id}", response_model=BaseResponse)
async def obtener_competencia(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Obtener detalles de una competencia."""
    try:
        competencia = await service.get_by_external_id(external_id)
        return ResponseHandler.success_response(
            summary="Competencia encontrada",
            message="Detalle de competencia obtenido",
            data=CompetenciaRead.model_validate(competencia).model_dump()
        )
    except HTTPException as e:
         if e.status_code == status.HTTP_404_NOT_FOUND:
            return ResponseHandler.not_found_response(
                entity="Competencia",
                message="Competencia no existe"
            )
         return ResponseHandler.error_response(
            summary="Error al obtener competencia",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e)
        )


@router.put("/{external_id}", response_model=BaseResponse)
async def actualizar_competencia(
    external_id: UUID,
    data: CompetenciaUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Actualizar una competencia (Admin o Entrenador propietario)."""
    try:
        # Validación de rol
        if str(current_user.profile.role) not in ["ADMINISTRADOR", "ENTRENADOR", "PASANTE"]:
             return ResponseHandler.forbidden_response(
                 message="Solo administradores, entrenadores y pasantes pueden modificar competencias"
             )

        competencia_actualizada = await service.update(external_id, data)
        return ResponseHandler.success_response(
            summary="Competencia actualizada con exito",
            message="Competencia actualizada correctamente",
            data=CompetenciaRead.model_validate(competencia_actualizada).model_dump()
        )
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
             return ResponseHandler.not_found_response(
                entity="Competencia",
                message="Competencia no encontrada para actualización"
            )
        return ResponseHandler.error_response(
            summary="Error al actualizar competencia",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
             summary="Error interno",
             message=str(e)
        )


@router.delete("/{external_id}", response_model=BaseResponse)
async def eliminar_competencia(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: CompetenciaService = Depends(get_competencia_service),
):
    """Eliminar una competencia (Admin o Entrenador)."""
    try:
        if str(current_user.profile.role) not in ["ADMINISTRADOR", "ENTRENADOR", "PASANTE"]:
            return ResponseHandler.forbidden_response(
                message="Solo administradores, entrenadores y pasantes pueden eliminar competencias"
            )
            
        await service.delete(external_id)
        return ResponseHandler.success_response(
            summary="Competencia eliminada con exito",
            message="Competencia eliminada correctamente",
            data={}
        )
    except HTTPException as e:
        if e.status_code == status.HTTP_404_NOT_FOUND:
            return ResponseHandler.not_found_response(
                entity="Competencia",
                message="Competencia no encontrada para eliminación"
            )
        return ResponseHandler.error_response(
            summary="Error al eliminar competencia",
            message=e.detail,
            status_code=e.status_code
        )
    except Exception as e:
        return ResponseHandler.error_response(
            summary="Error interno",
            message=str(e)
        )
