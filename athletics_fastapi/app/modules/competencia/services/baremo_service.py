from uuid import UUID
from fastapi import HTTPException, status
from app.modules.competencia.domain.models.baremo_model import Baremo
from app.modules.competencia.domain.schemas.baremo_schema import (
    BaremoCreate, BaremoUpdate
)
from app.modules.competencia.repositories.prueba_repository import PruebaRepository
from app.modules.competencia.repositories.baremo_repository import BaremoRepository

# Servicio para la gestión de Baremos
class BaremoService:

    def __init__(self, repo: BaremoRepository, prueba_repo: PruebaRepository, resultado_repo=None):
        self.repo = repo
        self.prueba_repo = prueba_repo
        self.resultado_repo = resultado_repo

    async def create(self, data: BaremoCreate) -> Baremo:
        # ... (same as before)
        # 1. Obtener y validar Prueba por UUID (si existe)
        prueba_id_final = None
        if data.prueba_id:
            prueba = await self.prueba_repo.get_by_external_id(data.prueba_id)
            if not prueba:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prueba no encontrada")
            prueba_id_final = prueba.id

        # Convertir datos principal a dict
        baremo_data = data.model_dump()
        items_data = baremo_data.pop("items", [])
        
        # Reemplazar UUID por ID interno (puede ser None)
        baremo_data['prueba_id'] = prueba_id_final
        
        from app.modules.competencia.domain.models.baremo_model import Baremo
        from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo
        
        # Crear instancia de Baremo
        baremo = Baremo(**baremo_data)
        
        # Crear instancias de Items y asociar
        if items_data:
            baremo.items = [ItemBaremo(**item) for item in items_data]
            
        return await self.repo.create(baremo)

    async def update(self, external_id: UUID, data: BaremoUpdate) -> Baremo:
        baremo = await self.repo.get_by_external_id(external_id)

        if not baremo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baremo no encontrado"
            )

        if self.resultado_repo:
            # Check if any result uses this baremo
            count = await self.resultado_repo.get_count_by_baremo_id(baremo.id)
            if count > 0:
                 raise HTTPException(
                     status_code=status.HTTP_400_BAD_REQUEST, 
                     detail="No se puede editar este baremo porque ya tiene resultados registrados. Cree uno nuevo si es necesario."
                 ) 
        
        # ... (rest of update)
        
    async def get(self, external_id: UUID) -> Baremo:
        return await self.repo.get_by_external_id(external_id)

    async def get_all(self, incluir_inactivos: bool = True):
        return await self.repo.get_all(incluir_inactivos)


    async def update(self, external_id: UUID, data: BaremoUpdate) -> Baremo:
        baremo = await self.repo.get_by_external_id(external_id)

        if not baremo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Baremo no encontrado"
            )

        # Extraer items antes de actualizar otros campos
        update_data = data.model_dump(exclude_unset=True)
        items_data = update_data.pop("items", None)

        # Actualizar campos básicos
        for field, value in update_data.items():
            setattr(baremo, field, value)

        # Si se enviaron items, actualizar la relación
        if items_data is not None:
            from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo
            
            # Limpiar items existentes
            baremo.items = []
            
            # Crear nuevos items
            if items_data:
                baremo.items = [ItemBaremo(**item) for item in items_data]

        return await self.repo.update(baremo)
