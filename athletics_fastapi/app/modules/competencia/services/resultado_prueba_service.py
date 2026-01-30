from uuid import UUID
from fastapi import HTTPException, status
from datetime import date

from app.modules.competencia.domain.models.resultado_prueba_model import ResultadoPrueba
from app.modules.competencia.domain.schemas.resultado_prueba_schema import (
    ResultadoPruebaCreate,
    ResultadoPruebaUpdate,
)
from app.modules.competencia.repositories.resultado_prueba_repository import ResultadoPruebaRepository
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.repositories.baremo_repository import BaremoRepository

class ResultadoPruebaService:
    """Servicio para manejar resultados de Pruebas (Test/Control) con evaluación automática."""

    def __init__(
        self,
        repo: ResultadoPruebaRepository,
        atleta_repo: AtletaRepository,
        prueba_repo: PruebaRepository,
        baremo_repo: BaremoRepository,
    ):
        self.repo = repo
        self.atleta_repo = atleta_repo
        self.prueba_repo = prueba_repo
        self.baremo_repo = baremo_repo

    async def create(self, data: ResultadoPruebaCreate, entrenador_id: int) -> ResultadoPrueba:
        """
        Crear un resultado de prueba (Test) con auto-clasificación.
        """
        from app.core.logging.logger import logger
        from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
        from app.modules.atleta.domain.models.atleta_model import Atleta
        
        # 0. Resolver UUIDs
        logger.info(f"🔍 Buscando Prueba con UUID: {data.prueba_id}")
        prueba = await self.prueba_repo.get_by_external_id(data.prueba_id)
        if not prueba:
            logger.error(f"❌ Prueba no encontrada con UUID: {data.prueba_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prueba no encontrada con ID: {data.prueba_id}")

        logger.info(f"✅ Prueba encontrada: {prueba.nombre} (ID: {prueba.id})")
        logger.info(f"🔍 Buscando Atleta con UUID: {data.atleta_id}")
        
        # Try to find atleta by external_id first
        atleta = await self.atleta_repo.get_by_external_id(data.atleta_id)
        
        # If not found, try to find by user.external_id (in case UUID is from auth_users)
        if not atleta:
            logger.warning("⚠️ Atleta no encontrado por external_id, buscando por user UUID...")
            user_repo = AuthUsersRepository(self.atleta_repo.session)
            user = await user_repo.get_by_external_id(data.atleta_id)
            
            if user:
                logger.info(f"✅ Usuario encontrado: {user.first_name} {user.last_name}")
                # Try to find atleta by user_id
                atleta = await self.atleta_repo.get_by_user_id(user.id)
                
                if not atleta:
                    # Create atleta record if it doesn't exist
                    logger.info(f"📝 Creando registro de Atleta para usuario {user.id}")
                    atleta = Atleta(
                        user_id=user.id,
                        anios_experiencia=0  # Default value
                    )
                    atleta = await self.atleta_repo.create(atleta)
                    logger.info(f"✅ Atleta creado con ID: {atleta.id}")
            else:
                logger.error(f"❌ Usuario no encontrado con UUID: {data.atleta_id}")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Atleta/Usuario no encontrado con ID: {data.atleta_id}")
             
        # 1. Validar Usuario de Atleta (para Sexo y Edad)
        if not atleta.user:
             raise HTTPException(status_code=400, detail="El atleta no tiene usuario asociado")

        # Cálculo de Edad
        if not atleta.user.fecha_nacimiento:
             raise HTTPException(status_code=400, detail="El atleta no tiene fecha de nacimiento registrada")
        
        today = date.today()
        edad = today.year - atleta.user.fecha_nacimiento.year - (
            (today.month, today.day) < (atleta.user.fecha_nacimiento.month, atleta.user.fecha_nacimiento.day)
        )
        sexo_atleta = atleta.user.sexo 
        
        # 3. Match Automático del Baremo
        baremo = await self.baremo_repo.find_by_context(prueba.id, sexo_atleta, edad)
        if not baremo:
            raise HTTPException(
                status_code=400, 
                detail=f"No se encontró un baremo (reglas) para Sexo: {sexo_atleta}, Edad: {edad} en esta prueba."
            )

        # 4. Clasificación Automática
        clasificacion_final = "SIN CLASIFICACION"
        
        logger.info(f"🎯 Iniciando clasificación para marca: {data.marca_obtenida}")
        logger.info(f"📊 Baremo encontrado ID: {baremo.id}, Items: {len(baremo.items) if baremo.items else 0}")
        
        match_found = False
        if baremo.items:
            for item in baremo.items:
                logger.info(f"  🔍 Comparando con Item: {item.clasificacion} | Rango: {item.marca_minima} - {item.marca_maxima}")
                # Fórmula: min <= marca <= max
                if item.marca_minima <= data.marca_obtenida <= item.marca_maxima:
                    clasificacion_final = item.clasificacion
                    match_found = True
                    logger.info(f"  ✅ ¡MATCH! Clasificación: {clasificacion_final}")
                    break
                else:
                    logger.info(f"  ❌ No match: {data.marca_obtenida} no está entre {item.marca_minima} y {item.marca_maxima}")
        
        if not match_found:
            logger.warning(f"⚠️ Ningún Item coincidió con la marca {data.marca_obtenida}. Clasificación: SIN CLASIFICACION")
        
        
        # 5. Persistencia
        resultado = ResultadoPrueba(
            atleta_id=atleta.id,
            prueba_id=prueba.id,
            baremo_id=baremo.id,
            # entrenador_id removed
            marca_obtenida=data.marca_obtenida,
            # unidad_medida removed
            clasificacion_final=clasificacion_final,
            # posicion_final removed
            fecha=data.fecha,
            estado=True
        )

        return await self.repo.create(resultado)

    async def get_by_external_id(self, external_id: UUID) -> ResultadoPrueba:
        resultado = await self.repo.get_by_external_id(external_id)
        if not resultado:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resultado de prueba no encontrado")
        return resultado

    async def get_all(self):
        return await self.repo.get_all()

    async def update(self, external_id: UUID, data: ResultadoPruebaUpdate) -> ResultadoPrueba:
        resultado = await self.get_by_external_id(external_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(resultado, field, value)
        return await self.repo.update(resultado)
