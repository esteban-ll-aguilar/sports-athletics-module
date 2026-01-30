from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, insert
from app.modules.external.domain.enums import ExternalClassTokenType
from app.modules.external.domain.models import ExternalTokenModel
from datetime import datetime
from app.core.logging.logger import logger



class ExternalUsersApiRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    
    async def get_token_by_type(self, token_type: ExternalClassTokenType) -> ExternalTokenModel | None:
        result = await self.session.execute(
            select(ExternalTokenModel)
            .where(
                ExternalTokenModel.token_type == token_type.value,
            )
        )
        token = result.scalar_one_or_none()
        logger.info(token)
        logger.info(token_type.value)
        logger.info("TODO: AAAAAA")

        return token

 
    
    async def update_token(self, token: str, external_id: str, token_type: ExternalClassTokenType) -> ExternalTokenModel | None:
        existing_token = await self.get_token_by_type(token_type)

        if not existing_token:
            await self.create_token(token, external_id, token_type)
        else:
            await self.session.execute(
                update(ExternalTokenModel)
                .where(
                ExternalTokenModel.token_type == token_type
            )
            .values(
                token=token,
                external_id=external_id,
                updated_at=datetime.now(),
            )
        )

        await self.session.commit()
        return await self.get_token_by_type(token_type)

    async def create_token(self, token: str, external_id: str, token_type: ExternalClassTokenType) -> ExternalTokenModel | None:
        await self.session.execute(
            insert(ExternalTokenModel)
            .values(
                token=token,
                external_id=external_id,
                token_type=token_type.value
            )
        )

        await self.session.commit()

        return await self.get_token_by_type(token_type)


    

    
    