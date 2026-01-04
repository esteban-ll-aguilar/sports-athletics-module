from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List

# -----------------------------
# Competencia Schemas
# -----------------------------
class CompetenciaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    fecha: date
    lugar: str = Field(..., min_length=1, max_length=255)
    estado: bool = True

class CompetenciaCreate(CompetenciaBase):
    """Schema para crear Competencia."""
    pass

class CompetenciaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    descripcion: Optional[str] = None
    fecha: Optional[date] = None
    lugar: Optional[str] = Field(None, min_length=1, max_length=255)
    estado: Optional[bool] = None

class CompetenciaRead(CompetenciaBase):
    id: int
    external_id: UUID
    entrenador_id: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True

# -----------------------------
# Resultado Competencia Schemas
# -----------------------------
class ResultadoCompetenciaBase(BaseModel):
    resultado: float
    unidad_medida: str = "m"
    posicion_final: str
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: bool = True

class ResultadoCompetenciaCreate(BaseModel):
    """Schema para crear Resultado. IDs vienen como UUID desde el frontend."""
    competencia_id: UUID
    atleta_id: UUID
    prueba_id: UUID
    resultado: float
    unidad_medida: str = "m"
    posicion_final: str
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: bool = True

class ResultadoCompetenciaUpdate(BaseModel):
    resultado: Optional[float] = None
    unidad_medida: Optional[str] = None
    posicion_final: Optional[str] = None
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: Optional[bool] = None

class ResultadoCompetenciaRead(ResultadoCompetenciaBase):
    id: int
    external_id: UUID
    competencia_id: int   # ✅ IDs internos como int
    atleta_id: int        # ✅ IDs internos como int
    prueba_id: int        # ✅ IDs internos como int
    entrenador_id: int    # ✅ IDs internos como int
    fecha_registro: date
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True
