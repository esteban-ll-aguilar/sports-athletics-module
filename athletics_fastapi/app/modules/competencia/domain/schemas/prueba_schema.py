from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date
from typing import List
from app.modules.competencia.domain.enums.enum import PruebaType, TipoMedicion
from app.modules.competencia.domain.schemas.baremo_schema import BaremoRead

# ----------------------
# Esquemas Pydantic para Prueba
# ----------------------
class PruebaBase(BaseModel):
    nombre: str
    siglas: str | None = None
    fecha_registro: date
    fecha_prueba: date | None = None
    tipo_prueba: PruebaType | None = None
    tipo_medicion: TipoMedicion
    unidad_medida: str
    estado: bool = True
    tipo_disciplina_id: int

# Crear Prueba
class PruebaCreate(PruebaBase):
    pass

# Actualizar Prueba
class PruebaUpdate(BaseModel):
    nombre: str | None = None
    siglas: str | None = None
    fecha_registro: date | None = None
    fecha_prueba: date | None = None
    tipo_prueba: PruebaType | None = None
    tipo_medicion: TipoMedicion | None = None
    unidad_medida: str | None = None
    estado: bool | None = None
    tipo_disciplina_id: int | None = None

# Leer Prueba
class PruebaRead(PruebaBase):
    id: int
    external_id: UUID
    baremos: List[BaremoRead] = []

    model_config = ConfigDict(from_attributes=True)
