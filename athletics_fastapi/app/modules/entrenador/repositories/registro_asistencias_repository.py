from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias
from app.modules.atleta.domain.models.atleta_model import Atleta

class RegistroAsistenciasRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, registro: RegistroAsistencias) -> RegistroAsistencias:
        from app.modules.auth.domain.models.user_model import UserModel
        self.session.add(registro)
        await self.session.commit()
        await self.session.refresh(registro)
        
        # Reload with relationships to satisfy Pydantic schema
        from sqlalchemy.orm import selectinload
        from app.modules.entrenador.domain.models.horario_model import Horario
        from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
        from app.modules.entrenador.domain.models.entrenador_model import Entrenador

        try:
             result = await self.session.execute(
                select(RegistroAsistencias)
                .where(RegistroAsistencias.id == registro.id)
                .options(
                    selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                    selectinload(RegistroAsistencias.asistencias),
                    selectinload(RegistroAsistencias.horario)
                        .selectinload(Horario.entrenamiento)
                        .selectinload(Entrenamiento.entrenador)
                        .selectinload(Entrenador.user)
                )
             )
             return result.scalars().first()
        except:
             return registro

    async def get_by_horario(self, horario_id: int) -> List[RegistroAsistencias]:
        from app.modules.auth.domain.models.user_model import UserModel
        from sqlalchemy.orm import selectinload
        from app.modules.entrenador.domain.models.horario_model import Horario
        from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
        from app.modules.entrenador.domain.models.entrenador_model import Entrenador

        result = await self.session.execute(
            select(RegistroAsistencias)
            .where(RegistroAsistencias.horario_id == horario_id)
            .options(
                selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                selectinload(RegistroAsistencias.asistencias),
                selectinload(RegistroAsistencias.horario)
                    .selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().all()
    
    async def get_by_id(self, registro_id: int) -> Optional[RegistroAsistencias]:
        from app.modules.auth.domain.models.user_model import UserModel
        from sqlalchemy.orm import selectinload
        from app.modules.entrenador.domain.models.horario_model import Horario
        from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
        from app.modules.entrenador.domain.models.entrenador_model import Entrenador

        result = await self.session.execute(
            select(RegistroAsistencias)
            .where(RegistroAsistencias.id == registro_id)
            .options(
                selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                selectinload(RegistroAsistencias.asistencias),
                selectinload(RegistroAsistencias.horario)
                    .selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().first()

    async def get_by_atleta_and_horario(self, atleta_id: int, horario_id: int) -> Optional[RegistroAsistencias]:
        from sqlalchemy.orm import selectinload
        from app.modules.auth.domain.models.user_model import UserModel
        from app.modules.entrenador.domain.models.horario_model import Horario
        from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
        from app.modules.entrenador.domain.models.entrenador_model import Entrenador

        result = await self.session.execute(
            select(RegistroAsistencias).where(
                RegistroAsistencias.atleta_id == atleta_id,
                RegistroAsistencias.horario_id == horario_id
            ).options(
                selectinload(RegistroAsistencias.atleta).selectinload(Atleta.user).selectinload(UserModel.auth),
                selectinload(RegistroAsistencias.asistencias),
                selectinload(RegistroAsistencias.horario)
                    .selectinload(Horario.entrenamiento)
                    .selectinload(Entrenamiento.entrenador)
                    .selectinload(Entrenador.user)
            )
        )
        return result.scalars().first()

    async def delete(self, registro: RegistroAsistencias) -> None:
        await self.session.delete(registro)
        await self.session.commit()
