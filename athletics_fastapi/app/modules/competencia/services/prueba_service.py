from ..repositories.prueba_repository import PruebaRepository
from ..domain.schemas.prueba_schema import PruebaCreate, PruebaUpdate

class PruebaService:
    def __init__(self, repo: PruebaRepository):
        self.repo = repo

    async def create_prueba(self, data: PruebaCreate):
        return await self.repo.create(data)

    async def get_prueba(self, external_id: str):
        return await self.repo.get(external_id)

    async def get_pruebas(self, skip: int = 0, limit: int = 100):
        return await self.repo.list(skip, limit)

    async def update_prueba(self, external_id: str, data: PruebaUpdate):
        return await self.repo.update(external_id, data)
