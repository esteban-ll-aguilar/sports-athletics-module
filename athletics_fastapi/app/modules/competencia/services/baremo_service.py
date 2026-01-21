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

    def __init__(self, repo: BaremoRepository, prueba_repo: PruebaRepository):
        self.repo = repo
        self.prueba_repo = prueba_repo

    async def create(self, data: BaremoCreate) -> Baremo:
        # 1. Obtener y validar Prueba por UUID
        prueba_uuid = data.prueba_id
        prueba = await self.prueba_repo.get_by_external_id(prueba_uuid)
        if not prueba:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prueba no encontrada")

        # Convertir datos principal a dict
        baremo_data = data.model_dump()
        items_data = baremo_data.pop("items", [])
        
        # Reemplazar UUID por ID interno
        baremo_data['prueba_id'] = prueba.id
        
        from app.modules.competencia.domain.models.baremo_model import Baremo
        from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo
        
        # Crear instancia de Baremo
        baremo = Baremo(**baremo_data)
        
        # Crear instancias de Items y asociar
        if items_data:
            baremo.items = [ItemBaremo(**item) for item in items_data]
            
        return await self.repo.create(baremo)
        
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

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(baremo, field, value)

        return await self.repo.update(baremo)
