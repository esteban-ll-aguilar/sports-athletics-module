"""Router para Atleta CRUD."""
from fastapi import APIRouter, Depends, status, Query, UploadFile, File, HTTPException
from uuid import UUID
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.atleta.services.atleta_service import AtletaService
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
    AtletaRead,
    AtletaDetail,
)
from app.modules.atleta.dependencies import get_atleta_service
from app.core.utils.file_handler import upload_file_to_cloud
import os

router = APIRouter()


@router.post("/", response_model=AtletaRead, status_code=status.HTTP_201_CREATED)
async def crear_atleta(
    data: AtletaCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Crear un nuevo atleta para el usuario actual."""
    return await service.create(data, current_user.id)


@router.get("/", response_model=list[AtletaRead])
async def listar_atletas(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str = Query(None),
):
    """Listar todos los atletas con búsqueda opcional."""
    if search:
        return await service.search(search, skip, limit)
    return await service.get_all(skip, limit)


@router.get("/profile/me", response_model=AtletaDetail)
async def obtener_mi_perfil(
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Obtener el perfil del atleta actual (si el usuario es atleta)."""
    return await service.get_by_user_id(current_user.id)


@router.get("/{external_id}", response_model=AtletaDetail)
async def obtener_atleta(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Obtener detalles de un atleta específico."""
    return await service.get_by_external_id(external_id)


@router.put("/{external_id}", response_model=AtletaRead)
async def actualizar_atleta(
    external_id: UUID,
    data: AtletaUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Actualizar información del atleta."""
    atleta = await service.get_by_external_id(external_id)
    
    # Validar que solo el usuario propietario o un admin pueda actualizar
    if atleta.user_id != current_user.id and current_user.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    
    return await service.update(atleta.id, data)


@router.post("/{external_id}/foto", response_model=AtletaRead)
async def subir_foto_perfil(
    external_id: UUID,
    file: UploadFile = File(...),
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Subir foto de perfil para un atleta."""
    atleta = await service.get_by_external_id(external_id)
    
    # Validar que solo el usuario propietario o un admin pueda subir foto
    if atleta.user_id != current_user.id and current_user.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    
    # Validar tipo de archivo
    allowed_extensions = {"jpg", "jpeg", "png", "gif"}
    file_ext = file.filename.split(".")[-1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Extensión no permitida")
    
    # Validar tamaño (máximo 5MB)
    file_size = len(await file.read())
    await file.seek(0)
    
    if file_size > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Archivo demasiado grande")
    
    # Guardar archivo
    try:
        file_path = await upload_file_to_cloud(file, folder="atletas", file_name=f"atleta_{atleta.id}")
        return await service.update_foto_perfil(atleta.id, file_path)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al subir archivo")


@router.post("/{external_id}/activar", response_model=AtletaRead)
async def activar_atleta(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Activar un atleta (usuario)."""
    atleta = await service.get_by_external_id(external_id)
    
    # Validar que solo el usuario propietario o un admin pueda activar
    if atleta.user_id != current_user.id and current_user.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    
    return await service.activate(atleta.id)


@router.post("/{external_id}/desactivar", response_model=AtletaRead)
async def desactivar_atleta(
    external_id: UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: AtletaService = Depends(get_atleta_service),
):
    """Desactivar un atleta (usuario)."""
    atleta = await service.get_by_external_id(external_id)
    
    # Validar que solo el usuario propietario o un admin pueda desactivar
    if atleta.user_id != current_user.id and current_user.role != "ADMINISTRADOR":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso")
    
    return await service.deactivate(atleta.id)
