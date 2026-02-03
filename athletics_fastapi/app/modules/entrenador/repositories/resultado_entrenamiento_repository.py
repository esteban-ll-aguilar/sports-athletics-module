from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from app.modules.entrenador.domain.models.resultado_entrenamiento_model import ResultadoEntrenamiento
from app.modules.entrenador.domain.schemas.resultado_entrenamiento_schema import ResultadoEntrenamientoCreate, ResultadoEntrenamientoUpdate

class ResultadoEntrenamientoRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, incluir_inactivos: bool = False, entrenador_id: Optional[int] = None) -> List[ResultadoEntrenamiento]:
        try:
            # Import needed models for joined loading
            from app.modules.atleta.domain.models.atleta_model import Atleta
            from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
            from app.modules.entrenador.domain.models.entrenador_model import Entrenador
            from app.modules.auth.domain.models.user_model import UserModel

            query = select(ResultadoEntrenamiento).options(
                selectinload(ResultadoEntrenamiento.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                selectinload(ResultadoEntrenamiento.entrenamiento).selectinload(Entrenamiento.horarios),
                selectinload(ResultadoEntrenamiento.entrenamiento).selectinload(Entrenamiento.entrenador).selectinload(Entrenador.user)
            )
            
            if not incluir_inactivos:
                query = query.filter(ResultadoEntrenamiento.estado == True)

            # Si se filtra por entrenador, debemos unir con Entrenamiento -> Entrenador
            if entrenador_id:
                # Entrenamiento is already imported above
                query = query.join(ResultadoEntrenamiento.entrenamiento).filter(Entrenamiento.entrenador_id == entrenador_id)

            result = await self.session.execute(query)
            return result.scalars().all()
        except Exception as e:
            print(f"ERROR in get_all: {e}")
            import traceback
            traceback.print_exc()
            raise e

    async def get_by_id(self, id: int) -> Optional[ResultadoEntrenamiento]:
        try:
            from app.modules.atleta.domain.models.atleta_model import Atleta
            from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
            from app.modules.auth.domain.models.user_model import UserModel
            
            query = select(ResultadoEntrenamiento).where(ResultadoEntrenamiento.id == id).options(
                selectinload(ResultadoEntrenamiento.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                selectinload(ResultadoEntrenamiento.entrenamiento).selectinload(Entrenamiento.horarios)
            )
            result = await self.session.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            print(f"ERROR in get_by_id: {e}")
            raise e
    
    async def get_by_external_id(self, external_id: uuid.UUID) -> Optional[ResultadoEntrenamiento]:
        query = select(ResultadoEntrenamiento).where(ResultadoEntrenamiento.external_id == external_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, schema: ResultadoEntrenamientoCreate, entrenamiento_internal_id: int, atleta_internal_id: int) -> ResultadoEntrenamiento:
        db_obj = ResultadoEntrenamiento(
            entrenamiento_id=entrenamiento_internal_id,
            atleta_id=atleta_internal_id,
            fecha=schema.fecha,
            distancia=schema.distancia,
            tiempo=schema.tiempo,
            unidad_medida=schema.unidad_medida,
            evaluacion=schema.evaluacion,
            observaciones=schema.observaciones,
            estado=schema.estado
        )
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, db_obj: ResultadoEntrenamiento, schema: ResultadoEntrenamientoUpdate) -> ResultadoEntrenamiento:
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_obj, key, value)
        
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, db_obj: ResultadoEntrenamiento) -> bool:
        # Soft delete normally
        db_obj.estado = False
        await self.session.commit()
        return True
