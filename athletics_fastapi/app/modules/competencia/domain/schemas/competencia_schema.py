"""Esquemas Pydantic para Competencia."""
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List


class CompetenciaBase(BaseModel):
    """Base schema para Competencia."""
    nombre: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    fecha: date
    lugar: str = Field(..., min_length=1, max_length=255)
    estado: bool = True


class CompetenciaCreate(CompetenciaBase):
    """Schema para crear Competencia."""
    pass


class CompetenciaUpdate(BaseModel):
    """Schema para actualizar Competencia."""
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    descripcion: Optional[str] = None
    fecha: Optional[date] = None
    lugar: Optional[str] = Field(None, min_length=1, max_length=255)
    estado: Optional[bool] = None


class CompetenciaRead(CompetenciaBase):
    """Schema para leer Competencia."""
    id: int
    external_id: UUID
    entrenador_id: int
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True


# Resultado Competencia Schemas
class ResultadoCompetenciaBase(BaseModel):
    """Base schema para Resultado."""
    resultado: float
    unidad_medida: str = "m"
    posicion_final: str
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: bool = True


class ResultadoCompetenciaCreate(BaseModel):
    """Schema para crear Resultado."""
    competencia_id: int
    atleta_id: int
    prueba_id: int
    resultado: float
    unidad_medida: str = "m"
    posicion_final: str
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None


class ResultadoCompetenciaUpdate(BaseModel):
    """Schema para actualizar Resultado."""
    resultado: Optional[float] = None
    unidad_medida: Optional[str] = None
    posicion_final: Optional[str] = None
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: Optional[bool] = None


class ResultadoCompetenciaRead(ResultadoCompetenciaBase):
    """Schema para leer Resultado."""
    id: int
    external_id: UUID
    competencia_id: int
    atleta_id: int
    prueba_id: int
    entrenador_id: int
    fecha_registro: date
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    class Config:
        from_attributes = True
