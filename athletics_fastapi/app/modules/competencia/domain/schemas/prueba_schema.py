from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date
from app.modules.competencia.domain.enums.enum import PruebaType

# ----------------------
# Esquemas Pydantic para Prueba
# ----------------------
class PruebaBase(BaseModel):
    siglas: str
    fecha_registro: date
    tipo_prueba: PruebaType
    unidad_medida: str
    estado: bool = True
    tipo_disciplina_id: int
    baremo_id: int

# Crear Prueba
class PruebaCreate(PruebaBase):
    pass

# Actualizar Prueba
class PruebaUpdate(BaseModel):
    siglas: str | None = None
    fecha_registro: date | None = None
    tipo_prueba: PruebaType | None = None
    unidad_medida: str | None = None
    estado: bool | None = None
    tipo_disciplina_id: int | None = None
    baremo_id: int | None = None

# Leer Prueba
class PruebaRead(PruebaBase):
    external_id: UUID

    model_config = ConfigDict(from_attributes=True)
