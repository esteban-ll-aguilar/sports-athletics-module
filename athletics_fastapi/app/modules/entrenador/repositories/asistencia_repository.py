from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import date
from app.modules.entrenador.domain.models.asistencia_model import Asistencia

class AsistenciaRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, asistencia: Asistencia) -> Asistencia:
        """
        Guarda un nuevo registro de asistencia en la base de datos.
        
        Args:
            asistencia (Asistencia): Objeto asistencia a crear.
        
        Returns:
            Asistencia: El objeto guardado.
        """
        self.session.add(asistencia)
        await self.session.commit()
        await self.session.refresh(asistencia)
        return asistencia

    async def get_by_registro_asistencias(self, registro_asistencias_id: int) -> List[Asistencia]:
        """
        Obtiene todas las asistencias asociadas a una inscripción (registro_asistencias_id).
        
        Args:
            registro_asistencias_id (int): ID de la inscripción.
            
        Returns:
            List[Asistencia]: Lista de asistencias.
        """
        result = await self.session.execute(
            select(Asistencia).where(Asistencia.registro_asistencias_id == registro_asistencias_id)
        )
        return result.scalars().all()
    
    async def get_by_id(self, asistencia_id: int) -> Optional[Asistencia]:
        """
        Obtiene una asistencia por su ID primario.
        
        Args:
            asistencia_id (int): ID de la asistencia.
            
        Returns:
            Optional[Asistencia]: La asistencia encontrada o None.
        """
        result = await self.session.execute(
            select(Asistencia).where(Asistencia.id == asistencia_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_registro_and_date(self, registro_id: int, fecha: date) -> Optional[Asistencia]:
        """
        Busca un registro de asistencia específico para una inscripción y una fecha.
        Útil para verificar duplicados o recuperar la asistencia de un día.
        
        Args:
            registro_id (int): ID de la inscripción.
            fecha (date): Fecha de la asistencia.
            
        Returns:
            Optional[Asistencia]: La asistencia si existe.
        """
        result = await self.session.execute(
            select(Asistencia).where(
                Asistencia.registro_asistencias_id == registro_id,
                Asistencia.fecha_asistencia == fecha
            )
        )
        return result.scalar_one_or_none()
    
    async def update(self, asistencia: Asistencia) -> Asistencia:
        """
        Confirma los cambios realizados en un objeto de asistencia.
        
        Args:
            asistencia (Asistencia): Objeto modificado.
            
        Returns:
            Asistencia: El objeto actualizado.
        """
        await self.session.commit()
        await self.session.refresh(asistencia)
        return asistencia
        
    async def delete(self, asistencia: Asistencia) -> None:
        """
        Elimina un registro de asistencia.
        
        Args:
            asistencia (Asistencia): Objeto a eliminar.
        """
        await self.session.delete(asistencia)
        await self.session.commit()
