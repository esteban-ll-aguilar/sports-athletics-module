from pydantic import BaseModel, Field
from datetime import date
from uuid import UUID
from typing import List, Optional

class RegistroPruebaCompetenciaBase(BaseModel):
    prueba_id: int = Field(..., example=1)
    auth_user_id: int = Field(..., example=10)
    id_entrenador: int = Field(..., example=5)
    valor: float = Field(..., example=10.35)
    fecha_registro: date = Field(..., example="2025-01-01")


class RegistroPruebaCompetenciaCreate(RegistroPruebaCompetenciaBase):
    pass

class RegistroPruebaCompetenciaUpdate(BaseModel):
    valor: Optional[float] = Field(None, example=10.50)
    fecha_registro: Optional[date] = Field(None, example="2025-01-02")

class RegistroPruebaCompetenciaResponse(RegistroPruebaCompetenciaBase):
    id: int
    external_id: UUID

    model_config = ConfigDict(from_attributes=True)

class RegistroPruebaCompetenciaList(BaseModel):
    items: List[RegistroPruebaCompetenciaResponse]
    total: int