from typing import List
from app.modules.atleta.repositories.atleta_repository import AtletaRepository
from app.modules.atleta.domain.models.atleta_model import Atleta

class AtletaService:
    def __init__(self, repository: AtletaRepository):
        self.repository = repository

    async def get_all_atletas(self) -> List[Atleta]:
        return await self.repository.get_all()
