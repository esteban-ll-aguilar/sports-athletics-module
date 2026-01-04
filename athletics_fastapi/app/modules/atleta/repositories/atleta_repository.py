from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from app.modules.auth.domain.models.auth_user_model import AuthUserModel


class AtletaRepository:
    """Repositorio para manejar 'atletas', basados en la tabla auth_users con role='ATLETA'"""

    def __init__(self, session: AsyncSession):
        self.session = session

    # ----------------------
    # Crear un atleta (opcional, si quieres duplicar en auth_users)
    # ----------------------
    async def create(self, atleta: AuthUserModel) -> AuthUserModel:
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        return atleta

    # ----------------------
    # Obtener por ID interno (primary key)
    # ----------------------
    async def get_by_id(self, atleta_id: int) -> AuthUserModel | None:
        result = await self.session.execute(
            select(AuthUserModel).where(
                AuthUserModel.id == atleta_id,
                AuthUserModel.role == "ATLETA"
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener por user_id (si alguna relación adicional existe)
    # ----------------------
    async def get_by_user_id(self, user_id: int) -> AuthUserModel | None:
        result = await self.session.execute(
            select(AuthUserModel).where(
                AuthUserModel.id == user_id,  # en auth_users, id = user_id
                AuthUserModel.role == "ATLETA"
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener por external_id (UUID)
    # ----------------------
    async def get_by_external_id(self, external_id: UUID) -> AuthUserModel | None:
        result = await self.session.execute(
            select(AuthUserModel).where(
                AuthUserModel.external_id == external_id,
                AuthUserModel.role == "ATLETA"
            )
        )
        return result.scalars().first()

    # ----------------------
    # Obtener todos los atletas (con paginación)
    # ----------------------
    async def get_all(self, skip: int = 0, limit: int = 100) -> list[AuthUserModel]:
        result = await self.session.execute(
            select(AuthUserModel)
            .where(AuthUserModel.role == "ATLETA")
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    # ----------------------
    # Actualizar atleta
    # ----------------------
    async def update(self, atleta: AuthUserModel) -> AuthUserModel:
        await self.session.merge(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        return atleta

    # ----------------------
    # Eliminar atleta (opcional)
    # ----------------------
    async def delete(self, atleta: AuthUserModel) -> None:
        await self.session.delete(atleta)
        await self.session.commit()

    # ----------------------
    # Contar atletas
    # ----------------------
    async def count(self) -> int:
        result = await self.session.execute(
            select(func.count(AuthUserModel.id)).where(AuthUserModel.role == "ATLETA")
        )
        return result.scalar() or 0
