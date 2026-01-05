from pydantic import BaseModel, ConfigDict
import uuid
from typing import Optional, List

class RegistroAsistenciasBase(BaseModel):
    pass

class RegistroAsistenciasCreate(RegistroAsistenciasBase):
    horario_id: int
    atleta_id: int

from app.modules.atleta.domain.schemas.atleta_simple_schema import AtletaSimpleResponse

class RegistroAsistenciasResponse(RegistroAsistenciasBase):
    id: int
    external_id: uuid.UUID
    horario_id: int
    atleta_id: int
    
    atleta: Optional[AtletaSimpleResponse] = None

    model_config = ConfigDict(from_attributes=True)
