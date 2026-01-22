from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ItemBaremoBase(BaseModel):
    clasificacion: str
    marca_minima: float
    marca_maxima: float
    estado: bool = True

class ItemBaremoCreate(ItemBaremoBase):
    pass

class ItemBaremoUpdate(BaseModel):
    clasificacion: str | None = None
    marca_minima: float | None = None
    marca_maxima: float | None = None
    estado: bool | None = None

class ItemBaremoRead(ItemBaremoBase):
    id: int
    external_id: UUID
    baremo_id: int

    model_config = ConfigDict(from_attributes=True)
