from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from uuid import UUID
from typing import List

from app.modules.pasante.repositories.pasante_repository import PasanteRepository
from app.modules.pasante.domain.schemas.pasante_schema import PasanteCreate, PasanteUpdate, PasanteRead
from app.modules.pasante.domain.models.pasante_model import Pasante

# Auth & User Modules
from app.core.jwt.jwt import PasswordHasher
from app.modules.auth.domain.models.user_model import UserModel
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.enums import RoleEnum, TipoEstamentoEnum

class PasanteService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = PasanteRepository(db)
        self.hasher = PasswordHasher()

    async def create(self, data: PasanteCreate) -> PasanteRead:
        # 1. Check if user exists (by email or ID)
        # Check by email
        email_normalized = data.email.strip().lower()
        result_email = await self.db.execute(
            select(AuthUserModel).where(AuthUserModel.email == email_normalized)
        )
        if result_email.scalar_one_or_none():
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario con este correo electrónico ya existe."
            )

        existing_user = await self.repository.get_by_identificacion(data.identificacion)
        if existing_user:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El usuario con esta identificación ya existe."
            )

        # 2. Create Auth User & User Profile
        # We use AuthService manually or replicate logic to ensure transactional integrity
        # Here replicating logic for finer control over the Transaction being passed
        
        try:
            # A. Create Auth User
            hashed_password = self.hasher.hash(data.password)
            auth_user = AuthUserModel(
                email=data.email,
                hashed_password=hashed_password,
                is_active=True
            )
            self.db.add(auth_user)
            await self.db.flush() # Get ID

            # B. Create User Profile (trigger will auto-create Pasante)
            new_user = UserModel(
                auth_user_id=auth_user.id,
                username=data.email.split("@")[0], # Simple username gen
                first_name=data.first_name,
                last_name=data.last_name,
                phone=data.phone,
                tipo_identificacion=data.tipo_identificacion,
                identificacion=data.identificacion,
                fecha_nacimiento=data.fecha_nacimiento,
                sexo=data.sexo,
                role=RoleEnum.PASANTE,
                tipo_estamento=TipoEstamentoEnum.ESTUDIANTES # interns are typically students
            )
            self.db.add(new_user)
            await self.db.flush() # This triggers sync_user_role() which creates Pasante

            # C. Find the auto-created Pasante record and update it
            result_pasante = await self.db.execute(
                select(Pasante).where(Pasante.user_id == new_user.id)
            )
            new_pasante = result_pasante.scalar_one()
            
            # Update with provided data
            new_pasante.fecha_inicio = data.fecha_inicio
            new_pasante.especialidad = data.especialidad
            new_pasante.institucion_origen = data.institucion_origen
            new_pasante.estado = True
            
            await self.db.flush()

            await self.db.commit()
            await self.db.refresh(new_pasante)
            
            # Construct Read Schema manually (or rely on from_attributes)
            # Need to populate the mixed fields from User
            
            return PasanteRead(
                id=new_pasante.id,
                external_id=new_pasante.external_id,
                user_id=new_user.id,
                first_name=new_user.first_name,
                last_name=new_user.last_name,
                email=auth_user.email,
                identificacion=new_user.identificacion,
                phone=new_user.phone,
                especialidad=new_pasante.especialidad,
                fecha_inicio=new_pasante.fecha_inicio,
                institucion_origen=new_pasante.institucion_origen,
                estado=new_pasante.estado
            )

        except Exception as e:
            await self.db.rollback()
            raise e

    async def get_all(self) -> List[PasanteRead]:
        pasantes = await self.repository.get_all()
        # Ensure we return valid Pydantic models with data from relationships
        return [PasanteRead.model_validate(p) for p in pasantes]

    async def update(self, external_id: UUID, data: PasanteUpdate) -> PasanteRead:
        pasante = await self.repository.get_by_external_id(external_id)
        if not pasante:
             raise HTTPException(status_code=404, detail="Pasante no encontrado")

        # Update Pasante Fields
        if data.especialidad is not None:
             pasante.especialidad = data.especialidad
        if data.institucion_origen is not None:
             pasante.institucion_origen = data.institucion_origen
        if data.estado is not None:
             pasante.estado = data.estado
             
        # Update User Fields (Need to fetch User)
        if any([data.first_name, data.last_name, data.phone]):
             if data.first_name: pasante.user.first_name = data.first_name
             if data.last_name: pasante.user.last_name = data.last_name
             if data.phone: pasante.user.phone = data.phone

        await self.db.commit()
        await self.db.refresh(pasante)
        return PasanteRead.model_validate(pasante)

    async def delete(self, external_id: UUID):
        pasante = await self.repository.get_by_external_id(external_id)
        if not pasante:
             raise HTTPException(status_code=404, detail="Pasante no encontrado")
             
        # Logical Delete (Set inactive) or Hard Delete?
        # Requirement usually implies management, lets do Hard Delete for now OR Deactivate
        # Given the "Basurero" icon in UI, likely Hard Delete. But safer to Deactivate auth user.
        
        await self.repository.delete(pasante)
        # Also delete or deactivate User? keeping it simple for now: Cascade delete handled by DB or explicit
        # User model has cascade="all, delete-orphan" on relations, so deleting User deletes Pasante.
        # But we are deleting Pasante here.
        # Let's delete the related User to clean up everything.
        
        await self.db.delete(pasante.user) # This will cascade delete pasante if configured, or we delete pasante first
        await self.db.commit()
