from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.representante.services.representante_service import RepresentanteService

async def get_representante_service(session: AsyncSession = Depends(get_session)) -> RepresentanteService:
    return RepresentanteService(session)