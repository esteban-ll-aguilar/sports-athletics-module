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
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[bool] = None

class TipoDisciplinaOut(TipoDisciplinaBase):
    id: int
    external_id: uuid.UUID

    class Config:
        orm_mode = True
