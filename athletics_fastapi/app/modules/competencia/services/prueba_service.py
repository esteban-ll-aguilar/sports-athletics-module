from fastapi import HTTPException
from ..repositories.prueba_repository import PruebaRepository
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate

class PruebaService:
    def __init__(self, repo: PruebaRepository):
        self.repo = repo

    async def create_prueba(self, data: PruebaCreate):
        return await self.repo.create(data)

    async def get_prueba(self, external_id: str):
        prueba = await self.repo.get(external_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")
        return prueba

    async def get_pruebas(self, skip: int = 0, limit: int = 100):
        return await self.repo.list(skip, limit)

    async def update_prueba(self, external_id: str, data: PruebaUpdate):
        # Primero verificamos si existe (o confiamos en que repo.update devuelva None si falla)
        # Asumiendo patrón optimista: intentamos update, o verificamos antes.
        # Generalmente es mejor verificar existencia.
        prueba = await self.repo.get(external_id)
        if not prueba:
            raise HTTPException(status_code=404, detail="Prueba no encontrada")
        
        return await self.repo.update(external_id, data)
