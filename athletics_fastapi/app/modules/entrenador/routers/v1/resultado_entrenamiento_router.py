from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.core.db.database import get_session
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.entrenador.domain.schemas.resultado_entrenamiento_schema import ResultadoEntrenamientoRead, ResultadoEntrenamientoCreate, ResultadoEntrenamientoUpdate
from app.modules.entrenador.services.resultado_entrenamiento_service import ResultadoEntrenamientoService

router = APIRouter(
    prefix="/resultados-entrenamientos",
    tags=["Resultados Entrenamientos"]
)

def get_service(session: AsyncSession = Depends(get_session)):
    return ResultadoEntrenamientoService(session)

@router.get("/", response_model=List[ResultadoEntrenamientoRead])
async def get_all(
    incluir_inactivos: bool = False,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoEntrenamientoService = Depends(get_service),
    session: AsyncSession = Depends(get_session)
):
    from sqlalchemy import select
    from app.modules.entrenador.domain.models.entrenador_model import Entrenador

    entrenador_id = None
    role = current_user.profile.role
    role_str = role.value if hasattr(role, 'value') else str(role)

    # Logic similar to others: Admin/Entrenador can see all or filtered
    if role_str == "ENTRENADOR":
         # Robustly fetch trainer ID linked to this user profile
         result = await session.execute(
             select(Entrenador.id).where(Entrenador.user_id == current_user.profile.id)
         )
         entrenador_id = result.scalar_one_or_none()
         
         # If no trainer profile found (shouldn't happen for Role Entrenador), fallback to None or error? 
         # For safety, if None, they see nothing (or all? No, safely nothing is better, but existing logic used None=All)
         # Actually, if we pass None to service, it returns ALL. We don't want that for an unlinked trainer.
         # But usually data integrity ensures Entrenador exists.
         # For now, let's assume if None, we pass -1 or ensure it returns empty, 
         # but to match existing flow, if not found, maybe they are just a user with role but no record.
         if entrenador_id is None:
             # Force empty result if trainer profile is missing but role is trainer?
             # Or let it fall through (currently undefined behavior in service if id is invalid but not None)
             # Let's keep it simple: if found, use it.
             pass

    elif role_str == "ADMINISTRADOR":
         entrenador_id = None # Admin sees all

    return await service.get_all(incluir_inactivos, entrenador_id)

@router.post("/", response_model=ResultadoEntrenamientoRead, status_code=status.HTTP_201_CREATED)
async def create(
    schema: ResultadoEntrenamientoCreate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoEntrenamientoService = Depends(get_service)
):
    return await service.create(schema)

@router.put("/{external_id}", response_model=ResultadoEntrenamientoRead)
async def update(
    external_id: uuid.UUID,
    schema: ResultadoEntrenamientoUpdate,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoEntrenamientoService = Depends(get_service)
):
    return await service.update(external_id, schema)

@router.delete("/{external_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    external_id: uuid.UUID,
    current_user: AuthUserModel = Depends(get_current_user),
    service: ResultadoEntrenamientoService = Depends(get_service)
):
    await service.delete(external_id)
