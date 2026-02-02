from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.modules.entrenador.domain.models.horario_model import Horario
from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
from app.modules.entrenador.domain.models.entrenador_model import Entrenador

class HorarioRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, horario: Horario) -> Horario:
        """
        Crea un nuevo horario en la base de datos.
        
        Args:
            horario (Horario): Horario a crear.
            
        Returns:
            Horario: Horario creado con relaciones cargadas.
        """
        self.session.add(horario)
        await self.session.commit()
        await self.session.refresh(horario)
        
        # Recargar con relaciones (eager loading)
        result = await self.session.execute(
            select(Horario)
            .where(Horario.id == horario.id)
            .options(
                selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().first()

    async def get_all_by_entrenamiento(self, entrenamiento_id: int) -> List[Horario]:
        """
        Obtiene todos los horarios asociados a un entrenamiento.
        
        Args:
            entrenamiento_id (int): ID del entrenamiento.
            
        Returns:
            List[Horario]: Lista de horarios con relaciones cargadas.
        """
        result = await self.session.execute(
            select(Horario)
            .where(Horario.entrenamiento_id == entrenamiento_id)
            .options(
                selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().all()

    async def get_by_id(self, horario_id: int) -> Optional[Horario]:
        """
        Busca un horario por su ID.
        
        Args:
            horario_id (int): ID del horario.
            
        Returns:
            Optional[Horario]: Horario encontrado con relaciones.
        """
        result = await self.session.execute(
            select(Horario)
            .where(Horario.id == horario_id)
            .options(
                selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().first()

    async def delete(self, horario: Horario) -> None:
        """
        Elimina un horario de la base de datos.
        
        Args:
            horario (Horario): Horario a eliminar.
        """
        await self.session.delete(horario)
        await self.session.commit()
