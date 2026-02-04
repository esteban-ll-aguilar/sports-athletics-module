from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.schemas.historial_medico_schema import (
    HistorialMedicoCreate,
    HistorialMedicoUpdate,
)


class HistorialMedicoService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: HistorialMedicoCreate, user_id: int) -> HistorialMedico:
        """
        Crea un historial médico asociado a un atleta.

        Verifica que el usuario sea un atleta válido, que tenga un perfil de atleta y que no tenga ya un historial médico.
        Calcula el IMC automáticamente basado en peso y talla.

        Args:
            data (HistorialMedicoCreate): Datos médicos del atleta (talla, peso, alergias, etc.).
            user_id (int): ID de autenticación del usuario.

        Returns:
            HistorialMedico: El objeto historial médico creado.
        
        Raises:
            HTTPException: 
                - 400 si el usuario no es atleta.
                - 400 si el usuario no tiene perfil de atleta.
                - 400 si ya existe un historial médico.
        """
    
        # Get user with profile join to check role
        result = await self.db.execute(
            select(AuthUserModel)
            .join(UserModel, AuthUserModel.id == UserModel.auth_user_id)
            .where(
                AuthUserModel.id == user_id,
                UserModel.role == RoleEnum.ATLETA
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario no existe o no es ATLETA"
            )

        # Get atleta by user_id
        result = await self.db.execute(
            select(Atleta).join(UserModel).where(UserModel.auth_user_id == user_id)
        )
        atleta = result.scalar_one_or_none()
        
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario no tiene perfil de atleta"
            )

        # Check if historial already exists
        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.atleta_id == atleta.id
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
            contacto_emergencia_nombre=data.contacto_emergencia_nombre,
            contacto_emergencia_telefono=data.contacto_emergencia_telefono,
            atleta_id=atleta.id
        )

        self.db.add(historial)
        await self.db.commit()
        await self.db.refresh(historial)
        return historial

    async def get(self, external_id: UUID) -> HistorialMedico:
        """
        Obtiene un historial médico por su ID externo (UUID).

        Args:
            external_id (UUID): Identificador único universal del historial médico.

        Returns:
            HistorialMedico: El historial médico encontrado.

        Raises:
            HTTPException: 404 si no se encuentra el historial.
        """
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
        """
        Obtiene el historial médico asociado a un usuario (Auth User ID).

        Este método busca primero el perfil de atleta asociado al usuario y luego su historial médico.

        Args:
            user_id (int): ID de autenticación del usuario.

        Returns:
            HistorialMedico: El historial médico del atleta.

        Raises:
            HTTPException: 
                - 404 si el atleta no es encontrado.
                - 404 si el historial no es encontrado.
        """
        # Get atleta by user_id, then get historial by atleta_id
        result = await self.db.execute(
            select(Atleta).join(UserModel).where(UserModel.auth_user_id == user_id)
        )
        atleta = result.scalar_one_or_none()
        
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado"
            )
        
        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.atleta_id == atleta.id
            )
        )
        historial = result.scalar_one_or_none()

        if not historial:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Historial no encontrado"
            )
        return historial

    async def get_by_profile_id(self, profile_id: int) -> HistorialMedico:
        """
        Obtiene el historial médico asociado a un ID de perfil de usuario.

        Similar a get_by_user, pero usa el profile_id (que corresponde al user_id en la tabla Atleta).

        Args:
            profile_id (int): ID del perfil de usuario (UserModel.id).

        Returns:
            HistorialMedico: El historial médico encontrado.

        Raises:
            HTTPException:
                - 404 si el atleta no es encontrado.
                - 404 si el historial no es encontrado.
        """
        # Get atleta by profile_id (user_id in Atleta table), then get historial
        result = await self.db.execute(
            select(Atleta).where(Atleta.user_id == profile_id)
        )
        atleta = result.scalar_one_or_none()
        
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado"
            )
            
        result = await self.db.execute(
            select(HistorialMedico).where(
                HistorialMedico.atleta_id == atleta.id
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
        """
        Obtiene una lista paginada de historiales médicos.

        Args:
            skip (int): Cantidad de registros a omitir.
            limit (int): Cantidad máxima de registros a retornar.

        Returns:
            List[HistorialMedico]: Lista de historiales médicos.
        """
        result = await self.db.execute(
            select(HistorialMedico).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def update(self, external_id: UUID, data: HistorialMedicoUpdate):
        """
        Actualiza parcialmente un historial médico existente.

        Args:
            external_id (UUID): ID externo del historial médico.
            data (HistorialMedicoUpdate): Datos a actualizar.

        Returns:
            HistorialMedico: El historial médico actualizado.

        Raises:
            HTTPException: 404 si el historial no se encuentra (heredado de get).
        """
        historial = await self.get(external_id)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(historial, key, value)

        await self.db.commit()
        await self.db.refresh(historial)
        return historial
