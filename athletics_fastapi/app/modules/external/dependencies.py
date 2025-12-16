from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
from app.modules.external.services.external_users_api_service import ExternalUsersApiService

async def get_external_users_service(session: AsyncSession = Depends(get_session)) -> ExternalUsersApiService:
    repository = ExternalUsersApiRepository(session)
    return ExternalUsersApiService(repository)
