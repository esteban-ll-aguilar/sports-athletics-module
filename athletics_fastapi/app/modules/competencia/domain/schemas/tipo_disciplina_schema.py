from pydantic import BaseModel
from typing import Optional
import uuid

# Modelo de esquemas Pydantic para la entidad TipoDisciplina
class TipoDisciplinaBase(BaseModel):
    nombre: str
    descripcion: str
    estado: Optional[bool] = True

class TipoDisciplinaCreate(TipoDisciplinaBase):
    pass

class TipoDisciplinaUpdate(BaseModel):
    nombre: Optional[str]
    descripcion: Optional[str]
    estado: Optional[bool]

class TipoDisciplinaOut(TipoDisciplinaBase):
    id: int
    external_id: uuid.UUID

    class Config:
        from_attributes = True
