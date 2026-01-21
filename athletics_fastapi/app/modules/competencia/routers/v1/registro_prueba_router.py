from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from typing import List

from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

from app.modules.competencia.domain.schemas.resultado_prueba_schema import (
    ResultadoPruebaCreate,
    ResultadoPruebaUpdate,
    ResultadoPruebaRead
)

from app.modules.competencia.services.resultado_prueba_service import ResultadoPruebaService
from app.modules.competencia.repositories.resultado_prueba_repository import ResultadoPruebaRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.repositories.baremo_repository import BaremoRepository
from app.core.db.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

# Dependency Injection Helper
def get_resultado_prueba_service(db: AsyncSession = Depends(get_session)):
    return ResultadoPruebaService(
        repo=ResultadoPruebaRepository(db),
        atleta_repo=AtletaRepository(db),
        prueba_repo=PruebaRepository(db),
        baremo_repo=BaremoRepository(db)
    )

router = APIRouter()

@router.post("/", response_model=ResultadoPruebaRead, status_code=status.HTTP_201_CREATED)
async def create_resultado_prueba(
    data: ResultadoPruebaCreate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    # Pass 0 or None for entrenador_id since it was removed from model, or update service signature
    return await service.create(data, 0)

@router.get("/", response_model=List[ResultadoPruebaRead])
async def get_all_resultados_prueba(
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    return await service.get_all()

@router.put("/{external_id}", response_model=ResultadoPruebaRead)
async def update_resultado_prueba(
    external_id: UUID,
    data: ResultadoPruebaUpdate,
    service: ResultadoPruebaService = Depends(get_resultado_prueba_service)
):
    return await service.update(external_id, data)
