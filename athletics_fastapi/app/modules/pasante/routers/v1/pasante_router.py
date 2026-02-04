from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum

from app.modules.pasante.domain.schemas.pasante_schema import PasanteCreate, PasanteUpdate, PasanteRead
from app.modules.pasante.services.pasante_service import PasanteService

router = APIRouter()

@router.post(
    "/",
    response_model=PasanteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo pasante",
    description="Crea un nuevo perfil de pasante en el sistema. Esta operación solo puede ser realizada por Administradores o Entrenadores."
)
async def create_pasante(
    data: PasanteCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Registra un nuevo pasante vinculándolo a un usuario existente.
    Verifica que el usuario que realiza la petición tenga los permisos adecuados.
    """
    if current_user.profile.role not in [RoleEnum.ENTRENADOR, RoleEnum.ADMINISTRADOR]:
        raise HTTPException(status_code=403, detail="No tiene permisos para registrar pasantes")
    
    service = PasanteService(db)
    return await service.create(data)

@router.get(
    "/",
    response_model=List[PasanteRead],
    summary="Listar todos los pasantes",
    description="Obtiene una lista de todos los pasantes registrados. Requiere permisos de Administrador o Entrenador."
)
async def list_pasantes(
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Retorna la lista completa de pasantes del sistema.
    """
    if current_user.profile.role not in [RoleEnum.ENTRENADOR, RoleEnum.ADMINISTRADOR]:
        raise HTTPException(status_code=403, detail="No tiene permisos para ver pasantes")
        
    service = PasanteService(db)
    return await service.get_all()

@router.put(
    "/{external_id}",
    response_model=PasanteRead,
    summary="Actualizar información de pasante",
    description="Modifica los datos de un pasante existente identificado por su external_id."
)
async def update_pasante(
    external_id: UUID,
    data: PasanteUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Actualiza la información del perfil de un pasante.
    """
    if current_user.profile.role not in [RoleEnum.ENTRENADOR, RoleEnum.ADMINISTRADOR]:
        raise HTTPException(status_code=403, detail="No tiene permisos para editar pasantes")

    service = PasanteService(db)
    return await service.update(external_id, data)

@router.delete(
    "/{external_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar pasante",
    description="Elimina de forma lógica o física el perfil de un pasante del sistema."
)
async def delete_pasante(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Elimina un pasante especificado por su external_id.
    """
    if current_user.profile.role not in [RoleEnum.ENTRENADOR, RoleEnum.ADMINISTRADOR]:
        raise HTTPException(status_code=403, detail="No tiene permisos para eliminar pasantes")

    service = PasanteService(db)
    await service.delete(external_id)
