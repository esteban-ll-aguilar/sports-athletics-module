from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema, UserUpdateSchema
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
        self.resultado_repo = ResultadoCompetenciaRepository(session)
        self.hasher = PasswordHasher()
        
    async def update_child_athlete(self, representante_user_id: int, atleta_id: int, update_data: UserUpdateSchema):
        """
        Actualiza los datos de un atleta (hijo) vinculado al representante.
        """
        # 1. Validar relación
        relation_check = await self._validate_relation(representante_user_id, atleta_id)
        if not relation_check["success"]:
            return relation_check
            
        atleta = relation_check["data"]
        
        # 2. Obtener el User object del atleta
        user_profile = await self.users_repo.get_by_id_profile(atleta.user_id)
        if not user_profile:
             user_profile = atleta.user
             
        # 3. Actualizar datos de Usuario
        updated_user = await self.users_repo.update(user_profile, update_data)
        
        # 4. Actualizar datos específicos de Atleta
        if update_data.atleta_data:
            atleta.anios_experiencia = update_data.atleta_data.anios_experiencia
            self.session.add(atleta)
            await self.session.commit()
        
        # 5. Recargar atleta con relaciones (eager loading)
        atleta_updated = await self.atleta_repo.get_by_id(atleta_id)
            
        return {
            "success": True,
            "message": "Atleta actualizado correctamente",
            "data": atleta_updated,
            "status_code": 200
        }

    async def get_representante_by_user_id(self, user_id: int) -> Representante | None:
        result = await self.session.execute(select(Representante).where(Representante.user_id == user_id))
        return result.scalars().one_or_none()

    async def register_child_athlete(self, representante_user_id: int, child_data: UserCreateSchema):
        """
        Registra un nuevo usuario como Atleta y lo vincula al Representante actual.
        """
        # 1. Verificar que el usuario actual es Representante
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            return {
                "success": False,
                "message": "El usuario no es un representante válido",
                "status_code": 403
            }

        # 2. Validar que el rol sea ATLETA
        child_data.role = RoleEnum.ATLETA

        # 3. Crear Usuario (AuthUser)
        pwd_hash = self.hasher.hash(child_data.password)
        
        try:
            new_user = await self.users_repo.create(password_hash=pwd_hash, user_data=child_data)
        except Exception as e:
            if "already exists" in str(e) or "duplicate key" in str(e):
                return {
                    "success": False,
                    "message": "El usuario ya existe (Email o Identificación)",
                    "status_code": 400
                }
            return {
                "success": False,
                "message": f"Error inesperado: {str(e)}",
                "status_code": 500
            }
        
        # 4. Vincular Atleta
        existing_atleta = await self.atleta_repo.get_by_user_id(new_user.id)
        
        if existing_atleta:
            existing_atleta.representante_id = representante.id
            self.session.add(existing_atleta)
            await self.session.commit()
            # Recargar con relaciones
            res_atleta = await self.atleta_repo.get_by_id(existing_atleta.id)
        else:
            new_atleta = Atleta(
                user_id=new_user.id,
                representante_id=representante.id,
                anios_experiencia=0 
            )
            res_atleta = await self.atleta_repo.create(new_atleta)
            
        return {
            "success": True,
            "message": "Atleta registrado exitosamente",
            "data": res_atleta,
            "status_code": 201
        }

    async def get_representante_athletes(self, representante_user_id: int):
        """
        Obtiene la lista de atletas asociados al representante.
        """
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            return {
                "success": False,
                "message": "El usuario no es un representante válido",
                "status_code": 403,
                "data": []
            }
            
        athletes = await self.atleta_repo.get_by_representante_id(representante.id)
        return {
            "success": True,
            "message": "Atletas obtenidos correctamente",
            "data": athletes,
            "status_code": 200
        }

    async def _validate_relation(self, representante_user_id: int, atleta_id: int):
        """Valida que el atleta pertenezca al representante."""
        representante = await self.get_representante_by_user_id(representante_user_id)
        if not representante:
            return {"success": False, "message": "No eres un representante válido", "status_code": 403}
            
        atleta = await self.atleta_repo.get_by_id(atleta_id)
        if not atleta:
            return {"success": False, "message": "Atleta no encontrado", "status_code": 404}
            
        if atleta.representante_id != representante.id:
            return {"success": False, "message": "No tienes permiso sobre este atleta", "status_code": 403}
            
        return {"success": True, "data": atleta, "status_code": 200, "message": "Validez confirmada"}

    async def get_athlete_historial(self, representante_user_id: int, atleta_id: int):
        """Obtiene historial de un atleta representado."""
        atleta_check = await self._validate_relation(representante_user_id, atleta_id)
        if not atleta_check["success"]:
            return atleta_check
            
        atleta = atleta_check["data"]
        historial = await self.resultado_repo.get_by_atleta(atleta.user_id)
        return {
            "success": True,
            "message": "Historial obtenido",
            "data": historial,
            "status_code": 200
        }

    async def get_athlete_stats(self, representante_user_id: int, atleta_id: int):
        """Obtiene estadísticas de un atleta representado."""
        atleta_check = await self._validate_relation(representante_user_id, atleta_id)
        if not atleta_check["success"]:
            return atleta_check
            
        atleta = atleta_check["data"]
        resultados = await self.resultado_repo.get_by_atleta(atleta.user_id)
        
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
            "success": True,
            "message": "Estadísticas obtenidas",
            "data": {
                "total_competencias": total_competencias,
                "medallas": medallas,
                "experiencia": atleta.anios_experiencia
            },
            "status_code": 200
        }
