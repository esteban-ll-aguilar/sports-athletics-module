from fastapi import HTTPException, status
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
)
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums import RoleEnum


class AtletaService:
    def __init__(
        self,
        atleta_repo: AtletaRepository,
        auth_repo: AuthUsersRepository,
    ):
        self.atleta_repo = atleta_repo
        self.auth_repo = auth_repo

    # CREATE
    async def create(self, data: AtletaCreate, user_id: int) -> Atleta:
        user = await self.auth_repo.get_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if user.role != RoleEnum.ATLETA:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios con rol ATLETA pueden crear perfil deportivo"
            )

        existing = await self.atleta_repo.get_by_user_id(user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El atleta ya existe"
            )

        atleta = Atleta(
            user_id=user_id,
            **data.model_dump()
        )

        return await self.atleta_repo.create(atleta)

    # READ BY ID
    async def get_by_id(self, atleta_id: int) -> Atleta:
        atleta = await self.atleta_repo.get_by_id(atleta_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado"
            )
        return atleta

    # READ CURRENT USER
    async def get_me(self, user_id: int) -> Atleta:
        atleta = await self.atleta_repo.get_by_user_id(user_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes perfil de atleta"
            )
        return atleta

    # READ ALL
    async def get_all(self, skip: int = 0, limit: int = 100):
        return await self.atleta_repo.get_all(skip, limit)

    # UPDATE
    async def update(self, atleta_id: int, data: AtletaUpdate) -> Atleta:
        atleta = await self.get_by_id(atleta_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(atleta, field, value)

        return await self.atleta_repo.update(atleta)

    # DELETE
    async def delete(self, atleta_id: int) -> None:
        atleta = await self.get_by_id(atleta_id)
        await self.atleta_repo.delete(atleta)

    # COUNT
    async def count(self) -> int:
        return await self.atleta_repo.count()
