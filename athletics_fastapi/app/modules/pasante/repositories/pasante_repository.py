from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List, Optional

from app.modules.pasante.domain.models.pasante_model import Pasante
from app.modules.auth.domain.models.user_model import UserModel

class PasanteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, pasante: Pasante) -> Pasante:
        self.session.add(pasante)
        await self.session.flush()
        return pasante

    async def getattr_by_id(self, pasante_id: int) -> Optional[Pasante]:
        result = await self.session.execute(
            select(Pasante)
            .where(Pasante.id == pasante_id)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
        )
        return result.scalar_one_or_none()

    async def get_by_external_id(self, external_id: UUID) -> Optional[Pasante]:
        result = await self.session.execute(
            select(Pasante)
            .where(Pasante.external_id == external_id)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[Pasante]:
        from app.modules.auth.domain.enums import RoleEnum
        
        # Primero obtener todos los usuarios con rol PASANTE
        result_users = await self.session.execute(
            select(UserModel)
            .where(UserModel.role == RoleEnum.PASANTE)
            .options(selectinload(UserModel.auth))
        )
        users_pasante = result_users.scalars().all()
        
        print(f"👥 Usuarios con rol PASANTE: {len(users_pasante)}")
        
        # Ahora obtener todos los registros de Pasante
        result_pasantes = await self.session.execute(
            select(Pasante)
            .options(selectinload(Pasante.user).selectinload(UserModel.auth))
            .order_by(Pasante.id.desc())
        )
        pasantes = list(result_pasantes.scalars().all())
        
        print(f"📋 Registros en tabla Pasante: {len(pasantes)}")
        
        # Crear registros de Pasante para usuarios que no tienen
        pasantes_user_ids = {p.user_id for p in pasantes}
        
        for user in users_pasante:
            if user.id not in pasantes_user_ids:
                print(f"✨ Creando registro de Pasante para usuario: {user.first_name} {user.last_name}")
                from datetime import date
                new_pasante = Pasante(
                    user_id=user.id,
                    fecha_inicio=date.today(),
                    especialidad="No especificada",
                    institucion_origen="No especificada",
                    estado=True
                )
                self.session.add(new_pasante)
                await self.session.flush()
                await self.session.refresh(new_pasante)
                # Cargar relaciones
                result = await self.session.execute(
                    select(Pasante)
                    .where(Pasante.id == new_pasante.id)
                    .options(selectinload(Pasante.user).selectinload(UserModel.auth))
                )
                new_pasante = result.scalar_one()
                pasantes.append(new_pasante)
        
        await self.session.commit()
        
        return pasantes
    
    async def get_by_identificacion(self, identificacion: str) -> Optional[str]:
        # Helper to check if user exists by ID before creating
        result = await self.session.execute(
            select(UserModel).where(UserModel.identificacion == identificacion)
        )
        return result.scalar_one_or_none()

    async def delete(self, pasante: Pasante):
        await self.session.delete(pasante)
