from fastapi import HTTPException
from ..repositories.prueba_repository import PruebaRepository
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate

class PruebaService:
    def __init__(self, repo: PruebaRepository, tipo_disciplina_repo):
        self.repo = repo
        self.tipo_disciplina_repo = tipo_disciplina_repo

    async def create_prueba(self, data: PruebaCreate):
        from app.core.logging.logger import logger
        
        logger.info(f"🔍 Creando Prueba: {data.nombre}")
        logger.info(f"📊 Validando TipoDisciplina ID: {data.tipo_disciplina_id}")
        
        # Validate TipoDisciplina
        try:
            tipo = await self.tipo_disciplina_repo.get_by_id(data.tipo_disciplina_id)
            if not tipo:
                logger.error(f"❌ TipoDisciplina {data.tipo_disciplina_id} no encontrado")
                raise HTTPException(status_code=404, detail=f"TipoDisciplina with id {data.tipo_disciplina_id} not found")
            
            logger.info(f"✅ TipoDisciplina encontrado: {tipo.nombre if hasattr(tipo, 'nombre') else tipo.id}")
            
            result = await self.repo.create(data)
            logger.info(f"✅ Prueba creada exitosamente: {result.nombre} (ID: {result.id})")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Error al crear Prueba: {str(e)}", exc_info=True)
            raise

    async def get_prueba(self, external_id: str):
        prueba = await self.repo.get_by_external_id(external_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")
        return prueba

    async def get_pruebas(self, skip: int = 0, limit: int = 100):
        return await self.repo.list(skip, limit)

    async def update_prueba(self, external_id: str, data: PruebaUpdate):
        # Primero verificamos si existe
        prueba = await self.repo.get_by_external_id(external_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")
        
        return await self.repo.update(external_id, data)
