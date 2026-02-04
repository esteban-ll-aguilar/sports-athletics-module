from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List
from app.modules.competencia.domain.enums.enum import Sexo
from app.modules.competencia.domain.schemas.item_baremo_schema import ItemBaremoRead, ItemBaremoCreate

# Modelo de esquemas Pydantic para la entidad Baremo (Contexto)
class BaremoBase(BaseModel):
    sexo: Sexo
    edad_min: int
    edad_max: int
    estado: bool = True

# Modelo para la creación de un Baremo (incluye items)
class BaremoCreate(BaremoBase):
    prueba_id: UUID
    items: List[ItemBaremoCreate]

# Modelo para la actualización de un Baremo
class BaremoUpdate(BaseModel):
    sexo: Sexo | None = None
    edad_min: int | None = None
    edad_max: int | None = None
    estado: bool | None = None
    items: List[ItemBaremoCreate] | None = None

# Modelo para la lectura de un Baremo
class BaremoRead(BaremoBase):
    id: int
    external_id: UUID
    prueba_id: int
    items: List[ItemBaremoRead] = []

    model_config = ConfigDict(from_attributes=True)
