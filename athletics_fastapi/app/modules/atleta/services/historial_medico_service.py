from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
)


class HistorialMedicoService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: HistorialMedicoCreate, user_id: int) -> HistorialMedico:
    
        result = await self.db.execute(
            select(AuthUserModel).where(
                AuthUserModel.id == user_id,
                AuthUserModel.role == RoleEnum.ATLETA
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario no existe o no es ATLETA"
            )

        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.auth_user_id == user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario ya tiene historial médico"
            )


        historial = HistorialMedico(
            talla=data.talla,
            peso=data.peso,
            imc= data.peso / (data.talla ** 2),
            alergias=data.alergias,
            enfermedades_hereditarias=data.enfermedades_hereditarias,
            enfermedades=data.enfermedades,
            auth_user_id=user_id
        )

        self.db.add(historial)
        await self.db.commit()
        await self.db.refresh(historial)
        return historial

    async def get(self, external_id: UUID) -> HistorialMedico:
        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.external_id == external_id
            )
        )
        historial = result.scalar_one_or_none()

        if not historial:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Historial no encontrado"
            )
        return historial

    async def get_by_user(self, user_id: int) -> HistorialMedico:
        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.auth_user_id == user_id
            )
        )
        historial = result.scalar_one_or_none()

        if not historial:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Historial no encontrado"
            )
        return historial

    async def get_all(self, skip: int = 0, limit: int = 100):
        result = await self.db.execute(
            select(HistorialMedico).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update(self, external_id: UUID, data: HistorialMedicoUpdate):
        historial = await self.get(external_id)

        for key, value in data.dict(exclude_unset=True).items():
            setattr(historial, key, value)

        await self.db.commit()
        await self.db.refresh(historial)
        return historial
