from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.domain.schemas.schemas_auth import UserCreate, RoleEnum
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.core.jwt.jwt import PasswordHasher
from app.modules.representante.domain.models.representante_model import Representante
from sqlalchemy import select

class RepresentanteService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.users_repo = AuthUsersRepository(session)
        self.atleta_repo = AtletaRepository(session)
        self.hasher = PasswordHasher()

    async def get_representante_by_user_id(self, user_id: int) -> Representante | None:
        result = await self.session.execute(select(Representante).where(Representante.user_id == user_id))
        return result.scalars().one_or_none()

    async def register_child_athlete(self, representante_user_id: int, child_data: UserCreate) -> Atleta:
        """
        Registra un nuevo usuario como Atleta y lo vincula al Representante actual.
        """
        # 1. Verificar que el usuario actual es Representante
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="El usuario no es un representante válido"
            )

        # 2. Validar que el rol sea ATLETA (aunque el schema lo valida, doble check)
        child_data.role = RoleEnum.ATLETA

        # 3. Crear Usuario (AuthUser)
        # Hash password
        pwd_hash = self.hasher.hash(child_data.password)
        
        try:
            new_user = await self.users_repo.create(password_hash=pwd_hash, user_data=child_data)
        except Exception as e:
            # Handle potential duplicate email/dni errors from repo
            if "already exists" in str(e) or "duplicate key" in str(e):
                 raise HTTPException(status_code=400, detail="El usuario ya existe (Email o Identificación)")
            raise e

        # 4. Crear Atleta vinculado
        new_atleta = Atleta(
            user_id=new_user.id,
            representante_id=representante.id,
            anios_experiencia=0 # Inicializar en 0 o pedir en formulario
        )

        created_atleta = await self.atleta_repo.create(new_atleta)
        
        return created_atleta

    async def get_representante_athletes(self, representante_user_id: int) -> list[Atleta]:
        """
        Obtiene la lista de atletas asociados al representante.
        """
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            return [] # O raise error 403
            
        return await self.atleta_repo.get_by_representante_id(representante.id)
