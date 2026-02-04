from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ItemBaremoBase(BaseModel):
    """
    Representación base de un rango de calificación dentro de un baremo.
    """
    clasificacion: str 
    marca_minima: float
    marca_maxima: float
    estado: bool = True

class ItemBaremoCreate(ItemBaremoBase):
    """
    Esquema utilizado para la creación de nuevos rangos de baremación.
    """
    pass

class ItemBaremoUpdate(BaseModel):
    """
    Esquema para la actualización parcial de un ItemBaremo.
    """
    clasificacion: str | None = None
    marca_minima: float | None = None
    marca_maxima: float | None = None
    estado: bool | None = None

class ItemBaremoRead(ItemBaremoBase):
    """
    Esquema de salida para la visualización detallada de un rango.
    Lee baremo
    """
    id: int
    external_id: UUID
    baremo_id: int

    model_config = ConfigDict(from_attributes=True)
