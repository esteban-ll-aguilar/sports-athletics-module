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

    async def create(self, data: AtletaCreate, user_id: int) -> Atleta:
        """
        Crea un nuevo perfil de atleta para un usuario específico.

        Verifica que el usuario exista, tenga el rol de 'ATLETA' y no posea ya un perfil creado.
        Si todas las validaciones pasan, crea y guarda el nuevo atleta en la base de datos.

        Args:
            data (AtletaCreate): Objeto con los datos necesarios para crear el atleta.
            user_id (int): Identificador único del usuario asociado al atleta.

        Returns:
            Atleta: La instancia del atleta creado.

        Raises:
            HTTPException: 
                - 404 si el usuario no existe.
                - 403 si el usuario no tiene el rol de ATLETA.
                - 400 si el atleta ya tiene un perfil registrado.
        """
        user = await self.auth_repo.get_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if user.user_profile.role != RoleEnum.ATLETA:
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

    async def get_by_id(self, atleta_id: int) -> Atleta:
        """
        Obtiene un atleta por su identificador único.

        Args:
            atleta_id (int): ID del atleta a buscar.

        Returns:
            Atleta: La instancia del atleta encontrado.

        Raises:
            HTTPException: 404 si el atleta no es encontrado.
        """
        atleta = await self.atleta_repo.get_by_id(atleta_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atleta no encontrado"
            )
        return atleta

    async def get_me(self, user_id: int) -> Atleta:
        """
        Obtiene el perfil de atleta asociado al usuario actual.

        Args:
            user_id (int): ID del usuario autenticado.

        Returns:
            Atleta: El perfil del atleta asociado al usuario.

        Raises:
            HTTPException: 404 si el usuario no tiene un perfil de atleta.
        """
        atleta = await self.atleta_repo.get_by_user_id(user_id)
        if not atleta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes perfil de atleta"
            )
        return atleta

    async def get_all(self, skip: int = 0, limit: int = 100):
        """
        Obtiene una lista paginada de todos los atletas.

        Args:
            skip (int, optional): Número de registros a saltar. Por defecto es 0.
            limit (int, optional): Número máximo de registros a retornar. Por defecto es 100.

        Returns:
            List[Atleta]: Lista de atletas encontrados.
        """
        return await self.atleta_repo.get_all(skip, limit)

    async def update(self, atleta_id: int, data: AtletaUpdate) -> Atleta:
        """
        Actualiza los datos de un atleta existente.

        Solo actualiza los campos proporcionados en el objeto de datos (actualización parcial).

        Args:
            atleta_id (int): ID del atleta a actualizar.
            data (AtletaUpdate): Datos a actualizar.

        Returns:
            Atleta: El atleta actualizado.
        
        Raises:
            HTTPException: 404 si el atleta no se encuentra (heredado de get_by_id).
        """
        atleta = await self.get_by_id(atleta_id)

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(atleta, field, value)

        return await self.atleta_repo.update(atleta)

    async def delete(self, atleta_id: int) -> None:
        """
        Elimina un atleta del sistema.

        Args:
            atleta_id (int): ID del atleta a eliminar.

        Raises:
            HTTPException: 404 si el atleta no se encuentra (heredado de get_by_id).
        """
        atleta = await self.get_by_id(atleta_id)
        await self.atleta_repo.delete(atleta)

    async def count(self) -> int:
        """
        Cuenta el número total de atletas registrados.

        Returns:
            int: El número total de atletas.
        """
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
