from fastapi import HTTPException
from ..repositories.prueba_repository import PruebaRepository
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate

class PruebaService:
    def __init__(self, repo: PruebaRepository, tipo_disciplina_repo, baremo_repo=None):
        self.repo = repo
        self.tipo_disciplina_repo = tipo_disciplina_repo
        self.baremo_repo = baremo_repo

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
            
            # Extract baremos_ids before creating Prueba
            baremos_ids = data.baremos_ids
            
            result = await self.repo.create(data)
            logger.info(f"✅ Prueba creada exitosamente: {result.nombre} (ID: {result.id})")
            
            # Assign Baremos if provided
            if baremos_ids and self.baremo_repo:
                logger.info(f"🔗 Asignando {len(baremos_ids)} baremos a la prueba...")
                for b_uuid in baremos_ids:
                    baremo = await self.baremo_repo.get_by_external_id(b_uuid)
                    if baremo:
                        baremo.prueba_id = result.id
                        await self.baremo_repo.update(baremo)
                        logger.info(f"   - Baremo asignado: {baremo.id}")
                    else:
                        logger.warning(f"   ⚠️ Baremo con UUID {b_uuid} no encontrado, omitiendo.")

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
        from app.core.logging.logger import logger

        # Primero verificamos si existe
        prueba = await self.repo.get_by_external_id(external_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")
        
        # Gestionar Baremos (Asociación/Desasociación)
        if data.baremos_ids is not None and self.baremo_repo:
            logger.info(f"🔄 Actualizando baremos para prueba {prueba.nombre}...")
            
            # 1. Desvincular baremos que ya no están en la lista
            # Nota: prueba.baremos está disponible gracias al eager loading del repo
            for baremo in prueba.baremos:
                if baremo.external_id not in data.baremos_ids:
                    baremo.prueba_id = None
                    await self.baremo_repo.update(baremo)
                    logger.info(f"   - Baremo desvinculado: {baremo.external_id}")
            
            # 2. Vincular nuevos baremos
            current_ids = [b.external_id for b in prueba.baremos]
            for b_uuid in data.baremos_ids:
                if b_uuid not in current_ids:
                    baremo_obj = await self.baremo_repo.get_by_external_id(b_uuid)
                    if baremo_obj:
                        baremo_obj.prueba_id = prueba.id
                        await self.baremo_repo.update(baremo_obj)
                        logger.info(f"   - Baremo vinculado: {baremo_obj.external_id}")

        return await self.repo.update(external_id, data)
