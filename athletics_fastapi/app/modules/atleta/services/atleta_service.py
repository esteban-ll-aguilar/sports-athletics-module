from fastapi import HTTPException, status
from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.atleta.domain.schemas.atleta_schema import (
    AtletaCreate,
    AtletaUpdate,
)
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums import RoleEnum
from app.modules.competencia.repositories.resultado_competencia_repository import ResultadoCompetenciaRepository


class AtletaService:
    def __init__(
        self,
        atleta_repo: AtletaRepository,
        auth_repo: AuthUsersRepository,
        resultado_repo: ResultadoCompetenciaRepository,  # Inyectado
    ):
        self.atleta_repo = atleta_repo
        self.auth_repo = auth_repo
        self.resultado_repo = resultado_repo

    # CREATE
    async def create(self, data: AtletaCreate, user_id: int) -> Atleta:
        user = await self.auth_repo.get_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if user.role != RoleEnum.ATLETA:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo usuarios con rol ATLETA pueden crear perfil deportivo"
            )

        existing = await self.atleta_repo.get_by_user_id(user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El atleta ya existe"
            )

        atleta = Atleta(
            user_id=user_id,
            **data.model_dump()
        )

        return await self.atleta_repo.create(atleta)

    # READ BY ID
    async def get_by_id(self, atleta_id: int) -> Atleta:
        atleta = await self.atleta_repo.get_by_id(atleta_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado"
            )
        return atleta

    # READ CURRENT USER
    async def get_me(self, user_id: int) -> Atleta:
        atleta = await self.atleta_repo.get_by_user_id(user_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes perfil de atleta"
            )
        return atleta

    # READ ALL
    async def get_all(self, skip: int = 0, limit: int = 100):
        return await self.atleta_repo.get_all(skip, limit)

    # UPDATE
    async def update(self, atleta_id: int, data: AtletaUpdate) -> Atleta:
        atleta = await self.get_by_id(atleta_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(atleta, field, value)

        return await self.atleta_repo.update(atleta)

    # DELETE
    async def delete(self, atleta_id: int) -> None:
        atleta = await self.get_by_id(atleta_id)
        await self.atleta_repo.delete(atleta)

    # COUNT
    async def count(self) -> int:
        return await self.atleta_repo.count()

    # EXTENDED FUNCTIONALITY FOR DASHBOARD (HU-020)
    async def get_historial(self, user_id: int):
        """Obtiene el historial de competencias del atleta."""
        # Verificamos que sea atleta
        atleta = await self.get_me(user_id)
        # Obtenemos resultados usando el user_id (que es el atleta_id en resultados)
        resultados = await self.resultado_repo.get_by_atleta(user_id)
        return resultados

    async def get_estadisticas(self, user_id: int):
        """Calcula estadísticas básicas para el dashboard."""
        atleta = await self.get_me(user_id)
        resultados = await self.resultado_repo.get_by_atleta(user_id)
        
        total_competencias = len(resultados)
        medallas = {
            "oro": 0,
            "plata": 0,
            "bronce": 0
        }
        
        # Lógica simple de conteo basada en 'posicion_final' o 'puesto_obtenido'
        # Asumiendo que TipoPosicion tiene valores como 'primero', 'segundo', 'tercero'
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
