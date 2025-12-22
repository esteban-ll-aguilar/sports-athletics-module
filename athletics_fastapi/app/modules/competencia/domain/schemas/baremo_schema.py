from pydantic import BaseModel
from uuid import UUID
from app.modules.competencia.domain.enums.enum import TipoClasificacion

# Modelo de esquemas Pydantic para la entidad Baremo

class BaremoBase(BaseModel):
    valor_baremo: float
    clasificacion: TipoClasificacion
    estado: bool = True

# Modelo para la creación de un Baremo
class BaremoCreate(BaremoBase):
    pass

# Modelo para la actualización de un Baremo
class BaremoUpdate(BaseModel):
    valor_baremo: float | None = None
    clasificacion: TipoClasificacion | None = None
    estado: bool | None = None

# Modelo para la lectura de un Baremo
class BaremoRead(BaremoBase):
    external_id: UUID

    class Config:
        from_attributes = True
