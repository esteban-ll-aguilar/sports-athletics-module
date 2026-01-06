from app.modules.competencia.domain.models.registro_prueba_competencia_model import (
    RegistroPruebaCompetencia
)
from app.modules.competencia.repositories.registro_prueba_competencia_repository import (
    RegistroPruebaCompetenciaRepository
)


class RegistroPruebaCompetenciaService:

    def __init__(self, repo: RegistroPruebaCompetenciaRepository):
        self.repo = repo

    async def create(self, data):
        registro = RegistroPruebaCompetencia(**data.model_dump())
        return await self.repo.create(registro)

    async def get_all(self):
        return await self.repo.get_all()

    async def get_one(self, external_id):
        return await self.repo.get_by_external_id(external_id)

    async def update(self, external_id, data):
        return await self.repo.update(
            external_id,
            data.model_dump(exclude_unset=True)
        )
