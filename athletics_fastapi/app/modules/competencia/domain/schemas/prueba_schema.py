from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import date
from typing import List
from app.modules.competencia.domain.enums.enum import PruebaType, TipoMedicion
from app.modules.competencia.domain.schemas.baremo_schema import BaremoRead

# ----------------------
# Esquemas Pydantic para Prueba
# ----------------------
class PruebaBase(BaseModel):
    """
    Define los atributos fundamentales de una prueba técnica.
    """
    nombre: str
    siglas: str | None = None
    fecha_registro: date
    fecha_prueba: date | None = None
    tipo_prueba: PruebaType | None = None
    tipo_medicion: TipoMedicion
    unidad_medida: str
    estado: bool = True
    tipo_disciplina_id: int

class PruebaCreate(PruebaBase):
    """
    Esquema para la creación de una nueva prueba.
    """
    pass

class PruebaUpdate(BaseModel):
    """
    Esquema para actualizaciones parciales de los datos de la prueba.
    """
    nombre: str | None = None
    siglas: str | None = None
    fecha_registro: date | None = None
    fecha_prueba: date | None = None
    tipo_prueba: PruebaType | None = None
    tipo_medicion: TipoMedicion | None = None
    unidad_medida: str | None = None
    estado: bool | None = None
    tipo_disciplina_id: int | None = None

class PruebaRead(PruebaBase):
    """
    Esquema de salida que incluye la composición completa de baremos asociados.
    """
    id: int
    external_id: UUID
    # baremos excluded - not needed for dashboard display

    model_config = ConfigDict(from_attributes=True)
