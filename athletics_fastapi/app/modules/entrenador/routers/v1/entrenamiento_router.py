from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoResponse, EntrenamientoCreate, EntrenamientoUpdate
from app.modules.entrenador.services.entrenamiento_service import EntrenamientoService
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.dependencies import get_current_entrenador
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

router = APIRouter(
    prefix="/entrenamientos",
    tags=["Entrenador - Entrenamientos"]
)

async def get_entrenamiento_service(session: AsyncSession = Depends(get_session)) -> EntrenamientoService:
    repo = EntrenamientoRepository(session)
    return EntrenamientoService(repo)

@router.post(
    "/", 
    response_model=EntrenamientoResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo entrenamiento",
    description="Registra un nuevo plan de entrenamiento y sus horarios asociados para el entrenador autenticado."
)
async def create_entrenamiento(
    entrenamiento_data: EntrenamientoCreate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """
    Crea un nuevo entrenamiento para el entrenador autenticado.
    """
    return await service.create_entrenamiento(entrenamiento_data, current_entrenador.id)

@router.get(
    "/", 
    response_model=List[EntrenamientoResponse],
    summary="Listar todos los entrenamientos",
    description="Obtiene una lista de entrenamientos. Los administradores y pasantes ven todos, mientras que los entrenadores ven solo los suyos."
)
async def list_entrenamientos(
    current_user: AuthUserModel = Depends(get_current_user),
    service: EntrenamientoService = Depends(get_entrenamiento_service),
    session: AsyncSession = Depends(get_session)
):
    """
    Obtiene todos los entrenamientos. Admins y Pasantes ven todo.
    """
    role = current_user.profile.role
    role_str = role.value if hasattr(role, 'value') else str(role)

    if role_str in ["ADMINISTRADOR", "PASANTE"]:
        return await service.get_all_entrenamientos()
    
    # Only for ENTRENADOR role, force the entrenador profile
    from app.modules.entrenador.dependencies import get_entrenador_repo, get_current_entrenador
    repo = await get_entrenador_repo(session)
    current_entrenador = await get_current_entrenador(current_user, repo)
        
    return await service.get_mis_entrenamientos(current_entrenador.id)

@router.get(
    "/{id}", 
    response_model=EntrenamientoResponse,
    summary="Obtener detalle de entrenamiento",
    description="Obtiene la información detallada de un entrenamiento específico por su ID, incluyendo sus horarios."
)
async def get_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """
    Obtiene el detalle de un entrenamiento específico, verificando que pertenezca al entrenador.
    """
    return await service.get_entrenamiento_detalle(id, current_entrenador.id)

@router.put(
    "/{id}", 
    response_model=EntrenamientoResponse,
    summary="Actualizar entrenamiento",
    description="Modifica un entrenamiento existente y actualiza su programación de horarios."
)
async def update_entrenamiento(
    id: int,
    entrenamiento_update: EntrenamientoUpdate,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """
    Actualiza los datos de un entrenamiento existente y su lista de horarios.
    """
    return await service.update_entrenamiento(id, entrenamiento_update, current_entrenador.id)

@router.delete(
    "/{id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar entrenamiento",
    description="Elimina físicamente un registro de entrenamiento y todos sus horarios vinculados."
)
async def delete_entrenamiento(
    id: int,
    current_entrenador: Entrenador = Depends(get_current_entrenador),
    service: EntrenamientoService = Depends(get_entrenamiento_service)
):
    """
    Elimina un entrenamiento y todos sus horarios asociados.
    """
    await service.delete_entrenamiento(id, current_entrenador.id)
