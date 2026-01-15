from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema
from app.modules.auth.domain.enums import RoleEnum
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.core.jwt.jwt import PasswordHasher
from app.modules.representante.domain.models.representante_model import Representante
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository
from sqlalchemy import select

class RepresentanteService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.users_repo = AuthUsersRepository(session)
        self.atleta_repo = AtletaRepository(session)
        self.resultado_repo = ResultadoCompetenciaRepository(session)
        self.hasher = PasswordHasher()

    async def get_representante_by_user_id(self, user_id: int) -> Representante | None:
        result = await self.session.execute(select(Representante).where(Representante.user_id == user_id))
        return result.scalars().one_or_none()

    async def register_child_athlete(self, representante_user_id: int, child_data: UserCreateSchema) -> Atleta:
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
            # users_repo.create now expects UserCreateSchema, which child_data IS.
            # And it returns UserModel.
            new_user = await self.users_repo.create(password_hash=pwd_hash, user_data=child_data)
        except Exception as e:
            # Handle potential duplicate email/dni errors from repo
            if "already exists" in str(e) or "duplicate key" in str(e):
                 raise HTTPException(status_code=400, detail="El usuario ya existe (Email o Identificación)")
            raise e
        
        # 4. Crear Atleta vinculado
        # NOTE: AuthUsersRepository.create ALREADY creates the role entity (Atleta) if role=ATLETA and atleta_data is present.
        # But RepresentanteService wants to link it to the representative (representante_id).
        # The current AuthUsersRepository.create does NOT handle representante_id.
        # So we likely need to UPDATE the created Atleta or create it manually here if the repo didn't create it.
        # However, UserCreateSchema has atleta_data optional. 
        # If child_data has atleta_data, repo creates Atleta.
        # If we rely on repo to create Atleta, we need a way to pass representative_id or set it after.
        # The repo implementation:
        # if user_data.role == RoleEnum.ATLETA and user_data.atleta_data:
        #    atleta = Atleta(user_id=..., anios_experiencia=...)
        #    db.add(atleta)
        # It does NOT set representante_id.
        
        # FIX: We should fetch the created Atleta (via user_id) and update its representante_id.
        # Or, if repo didn't create it (e.g. no atleta_data), create it here.
        # Let's assume repo logic runs first.
        
        # We need to find the Atleta associated with new_user.id
        existing_atleta = await self.atleta_repo.get_by_user_id(new_user.id)
        
        if existing_atleta:
             existing_atleta.representante_id = representante.id
             self.session.add(existing_atleta)
             await self.session.commit()
             await self.session.refresh(existing_atleta)
             return existing_atleta
        else:
             # If repo didn't create it (maybe no atleta_data?), create it.
             new_atleta = Atleta(
                user_id=new_user.id,
                representante_id=representante.id,
                anios_experiencia=0 
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

    async def _validate_relation(self, representante_user_id: int, atleta_id: int):
        """Valida que el atleta pertenezca al representante."""
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            raise HTTPException(status_code=403, detail="No eres un representante válido")
            
        atleta = await self.atleta_repo.get_by_id(atleta_id)
        if not atleta:
            raise HTTPException(status_code=404, detail="Atleta no encontrado")
            
        if atleta.representante_id != representante.id:
            raise HTTPException(status_code=403, detail="No tienes permiso sobre este atleta")
            
        # Retorna el atleta para usar datos si es necesario (ej: user_id)
        return atleta

    async def get_athlete_historial(self, representante_user_id: int, atleta_id: int):
        """Obtiene historial de un atleta representado."""
        atleta = await self._validate_relation(representante_user_id, atleta_id)
        # Usamos atleta.user_id porque los resultados están ligados al user_id
        return await self.resultado_repo.get_by_atleta(atleta.user_id)

    async def get_athlete_stats(self, representante_user_id: int, atleta_id: int):
        """Obtiene estadísticas de un atleta representado."""
        atleta = await self._validate_relation(representante_user_id, atleta_id)
        resultados = await self.resultado_repo.get_by_atleta(atleta.user_id)
        
        # Logica duplicada de AtletaService (se podría refactorizar en un helper o mixin)
        total_competencias = len(resultados)
        medallas = {"oro": 0, "plata": 0, "bronce": 0}
        
        for res in resultados:
            pos = str(res.posicion_final).lower()
            if "primero" in pos or res.puesto_obtenido == 1:
                medallas["oro"] += 1
            elif "segundo" in pos or res.puesto_obtenido == 2:
                medallas["plata"] += 1
            elif "tercero" in pos or res.puesto_obtenido == 3:
                medallas["bronce"] += 1
                
        return {
            "total_competencias": total_competencias,
            "medallas": medallas,
            "experiencia": atleta.anios_experiencia
        }
