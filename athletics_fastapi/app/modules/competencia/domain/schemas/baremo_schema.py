from pydantic import BaseModel
from uuid import UUID
from app.modules.competencia.domain.enums.enum import TipoClasificacion

class BaremoBase(BaseModel):
    valor_baremo: float
    clasificacion: TipoClasificacion
    estado: bool = True


class BaremoCreate(BaremoBase):
    pass


class BaremoUpdate(BaseModel):
    valor_baremo: float | None = None
    clasificacion: TipoClasificacion | None = None
    estado: bool | None = None


class BaremoRead(BaremoBase):
    external_id: UUID

    class Config:
        from_attributes = True
