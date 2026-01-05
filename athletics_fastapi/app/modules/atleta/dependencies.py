"""Dependencias para el módulo de Atleta."""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.atleta.services.atleta_service import AtletaService


# ============================
# Servicio Atleta (CRUD)
# ============================
async def get_atleta_service(
    session: AsyncSession = Depends(get_session)
) -> AtletaService:
    repo = AtletaRepository(session)
    return AtletaService(repo, session)

