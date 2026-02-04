from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import selectinload

from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum

class AtletaRepository:
    """Repositorio para manejar la entidad 'Atleta'"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, atleta: Atleta) -> Atleta:
        """
        Guarda un nuevo atleta en la base de datos y recupera sus relaciones.
        
        Args:
            atleta (Atleta): Instancia de atleta a guardar.
            
        Returns:
            Atleta: El atleta guardado con los datos de usuario cargados.
        """
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        
        # Load user and nest load auth for email property
        stmt = (
            select(Atleta)
            .where(Atleta.id == atleta.id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_id(self, atleta_id: int) -> Optional[Atleta]:
        """
        Busca un atleta por su ID primario.
        
        Args:
            atleta_id (int): ID de la tabla atleta.
            
        Returns:
            Optional[Atleta]: El atleta si existe, o None.
        """
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.id == atleta_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    async def get_by_user_id(self, user_id: int) -> Optional[Atleta]:
        """
        Busca un atleta por el ID de su usuario asociado (clave foránea).
        
        Args:
            user_id (int): ID de la tabla users.
            
        Returns:
            Optional[Atleta]: El atleta si existe, o None.
        """
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.user_id == user_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    async def get_by_external_id(self, external_id: UUID) -> Optional[Atleta]:
        """
        Busca un atleta por su ID externo (UUID público).
        
        Args:
            external_id (UUID): UUID del atleta.
            
        Returns:
            Optional[Atleta]: El atleta si existe, o None.
        """
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.external_id == external_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Atleta]:
        """
        Recupera una lista paginada de todos los atletas registrados.
        
        Args:
            skip (int): Desplazamiento de registros.
            limit (int): Límite de registros a traer.
            
        Returns:
            List[Atleta]: Lista de objetos Atleta.
        """
        result = await self.session.execute(
            select(Atleta)
            .join(Atleta.user)
            .where(UserModel.role == RoleEnum.ATLETA)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update(self, atleta: Atleta) -> Atleta:
        """
        Persiste los cambios de un objeto atleta en la base de datos.
        
        Args:
            atleta (Atleta): Objeto atleta con los datos modificados.
            
        Returns:
            Atleta: El atleta actualizado con relaciones recargadas.
        """
        self.session.add(atleta)
        await self.session.commit()
        await self.session.refresh(atleta)
        # Reload relationships
        stmt = (
            select(Atleta)
            .where(Atleta.id == atleta.id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def delete(self, atleta: Atleta) -> None:
        """
        Elimina un atleta de la base de datos.
        
        Args:
            atleta (Atleta): Objeto atleta a eliminar.
        """
        await self.session.delete(atleta)
        await self.session.commit()

    async def count(self) -> int:
        """
        Cuenta el número total de atletas con rol de ATLETA activo.
        
        Returns:
            int: Cantidad de atletas.
        """
        result = await self.session.execute(
            select(func.count(Atleta.id))
            .join(Atleta.user)
            .where(UserModel.role == RoleEnum.ATLETA)
        )
        return result.scalar() or 0

    async def get_by_representante_id(self, representante_id: int) -> List[Atleta]:
        """
        Obtiene lista de atletas asociados a un representante (entrenador/encargado).
        
        Args:
            representante_id (int): ID del representante.
            
        Returns:
            List[Atleta]: Lista de atletas a su cargo.
        """
        result = await self.session.execute(
            select(Atleta)
            .where(Atleta.representante_id == representante_id)
            .options(
                selectinload(Atleta.user).selectinload(UserModel.auth)
            )
        )
        return result.scalars().all()



