"""Servicio de negocio para Atleta."""
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
    AtletaRead,
)
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository


class AtletaService:
    """Servicio para manejar la lógica de negocio de Atleta."""

    def __init__(self, repo: AtletaRepository, session: AsyncSession):
        self.repo = repo
        self.session = session
        self.auth_repo = AuthUsersRepository(session)

    async def create(self, data: AtletaCreate, user_id: int) -> Atleta:
        """Crear un nuevo atleta."""
        # Verificar que el usuario exista
        user = await self.auth_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )

        # Verificar que el usuario no sea ya un atleta
        existing_atleta = await self.repo.get_by_user_id(user_id)
        if existing_atleta:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este usuario ya es atleta",
            )

        # Crear el atleta
        atleta = Atleta(
            **data.model_dump(),
            user_id=user_id,
        )
        return await self.repo.create(atleta)

    async def get_by_id(self, id: int) -> Atleta:
        """Obtener atleta por ID."""
        atleta = await self.repo.get_by_id(id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado",
            )
        return atleta

    async def get_by_external_id(self, external_id: UUID) -> Atleta:
        """Obtener atleta por external_id."""
        atleta = await self.repo.get_by_external_id(external_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado",
            )
        return atleta

    async def get_by_user_id(self, user_id: int) -> Atleta:
        """Obtener atleta por user_id."""
        atleta = await self.repo.get_by_user_id(user_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El usuario no es atleta",
            )
        return atleta

    async def get_all(self, skip: int = 0, limit: int = 100):
        """Obtener todos los atletas."""
        return await self.repo.get_all(skip, limit)

    async def search(self, search_term: str, skip: int = 0, limit: int = 100):
        """Buscar atletas por nombre."""
        if not search_term.strip():
            return await self.get_all(skip, limit)
        return await self.repo.search_by_name(search_term, skip, limit)

    async def update(self, atleta_id: int, data: AtletaUpdate) -> Atleta:
        """Actualizar un atleta."""
        atleta = await self.get_by_id(atleta_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(atleta, field, value)

        return await self.repo.update(atleta)

    async def update_foto_perfil(self, atleta_id: int, foto_url: str) -> Atleta:
        """Actualizar la foto de perfil del atleta."""
        atleta = await self.get_by_id(atleta_id)
        atleta.foto_perfil = foto_url
        return await self.repo.update(atleta)

    async def activate(self, atleta_id: int) -> Atleta:
        """Activar un atleta (activar su usuario asociado)."""
        atleta = await self.get_by_id(atleta_id)
        user = await self.auth_repo.get_by_id(atleta.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        user.is_active = True
        await self.session.commit()
        return atleta

    async def deactivate(self, atleta_id: int) -> Atleta:
        """Desactivar un atleta (desactivar su usuario asociado)."""
        atleta = await self.get_by_id(atleta_id)
        user = await self.auth_repo.get_by_id(atleta.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        user.is_active = False
        await self.session.commit()
        return atleta

    async def count(self) -> int:
        """Contar total de atletas."""
        return await self.repo.count()
