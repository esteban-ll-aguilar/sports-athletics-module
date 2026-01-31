from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.domain.models.entrenador_model import Entrenador


class EntrenamientoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, entrenamiento: Entrenamiento) -> Entrenamiento:
        """
        Crea un entrenamiento y carga sus horarios asociados.
        
        Args:
            entrenamiento (Entrenamiento): Objeto a persistir.
            
        Returns:
            Entrenamiento: El objeto persistido con horarios cargados.
        """
        self.session.add(entrenamiento)
        await self.session.commit()
        # Explicitly reload with eager loading for requirements of the response schema
        # Since refresh() resets attributes, we need to ensure the relationship is loaded relative to the session
        # Standard refresh might not load relationships unless configured.
        # A safer async approach is executing a select with options
        from sqlalchemy.orm import selectinload
        
        # We can refresh the instance, but to get relationships loaded in async, it's often better to re-query 
        # or rely on expiry if the session is still active (but Pydantic access might be outside async Io context if not careful)
        # However, MissingGreenlet usually means we touched a lazy loader.
        # Let's re-fetch fully to be safe.
        
        result = await self.session.execute(
             select(Entrenamiento)
             .where(Entrenamiento.id == entrenamiento.id)
             .options(selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def get_all_by_entrenador(self, entrenador_id: int) -> List[Entrenamiento]:
        """
        Recupera todos los entrenamientos de un entrenador.
        
        Incluye la carga de horarios y datos del entrenador (user).
        
        Args:
            entrenador_id (int): ID del entrenador.
            
        Returns:
            List[Entrenamiento]: Lista de entrenamientos.
        """
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.entrenador_id == entrenador_id)
            .options(
                 selectinload(Entrenamiento.entrenador)
            .selectinload(Entrenador.user),
                selectinload(Entrenamiento.horarios)
                
                )
        )
        return result.scalars().all()

    async def get_by_external_id(self, external_id: str) -> Optional[Entrenamiento]:
        """
        Obtiene un entrenamiento por su ID externo (UUID).
        """
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.external_id == external_id)
            .options(
                selectinload(Entrenamiento.entrenador).selectinload(Entrenador.user),
                selectinload(Entrenamiento.horarios)
            )
        )
        return result.scalars().first()

    async def get_by_id(self, entrenamiento_id: int) -> Optional[Entrenamiento]:
        """
        Obtiene un entrenamiento por ID.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            
        Returns:
            Optional[Entrenamiento]: Entrenamiento encontrado.
        """
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(Entrenamiento.id == entrenamiento_id)
            .options(selectinload(Entrenamiento.entrenador)
            .selectinload(Entrenador.user),
                selectinload(Entrenamiento.horarios)
                     )
        )
        return result.scalars().first()
    
    async def get_by_id_and_entrenador(self, entrenamiento_id: int, entrenador_id: int) -> Optional[Entrenamiento]:
        """
        Busca un entrenamiento específico validando que pertenezca al entrenador dado.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            entrenador_id (int): ID del entrenador propietario.
            
        Returns:
            Optional[Entrenamiento]: El entrenamiento si coincide.
        """
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
            select(Entrenamiento)
            .where(
                Entrenamiento.id == entrenamiento_id,
                Entrenamiento.entrenador_id == entrenador_id
            )
            .options(selectinload(Entrenamiento.entrenador)
            .selectinload(Entrenador.user),selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def update(self, entrenamiento: Entrenamiento) -> Entrenamiento:
        """
        Guarda los cambios de un entrenamiento.
        
        Args:
            entrenamiento (Entrenamiento): Objeto modificado.
            
        Returns:
            Entrenamiento: Objeto actualizado y recargado.
        """
        self.session.add(entrenamiento)
        await self.session.commit()
        
        # Re-fetch to ensure relationships like 'horarios' are loaded for response
        from sqlalchemy.orm import selectinload
        result = await self.session.execute(
             select(Entrenamiento)
             .where(Entrenamiento.id == entrenamiento.id)
             .options(selectinload(Entrenamiento.entrenador)
            .selectinload(Entrenador.user),selectinload(Entrenamiento.horarios))
        )
        return result.scalars().first()

    async def delete(self, entrenamiento: Entrenamiento) -> None:
        """
        Elimina un entrenamiento de la base de datos.
        
        Args:
            entrenamiento (Entrenamiento): Objeto a eliminar.
        """
        await self.session.delete(entrenamiento)
        await self.session.commit()
