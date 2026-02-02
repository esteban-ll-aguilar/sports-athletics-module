from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from app.modules.entrenador.domain.schemas.entrenamiento_schema import EntrenamientoResponse
from app.modules.atleta.domain.schemas.atleta_simple_schema import AtletaSimpleResponse

class ResultadoEntrenamientoBase(BaseModel):
    fecha: date
    distancia: Optional[float] = None
    tiempo: Optional[float] = None
    unidad_medida: Optional[str] = None
    evaluacion: Optional[int] = Field(None, ge=1, le=10)
    observaciones: Optional[str] = None
    estado: bool = True

class ResultadoEntrenamientoCreate(ResultadoEntrenamientoBase):
    entrenamiento_id: UUID
    atleta_id: UUID

class ResultadoEntrenamientoUpdate(BaseModel):
    fecha: Optional[date] = None
    distancia: Optional[float] = None
    tiempo: Optional[float] = None
    unidad_medida: Optional[str] = None
    evaluacion: Optional[int] = Field(None, ge=1, le=10)
    observaciones: Optional[str] = None
    estado: Optional[bool] = None

class ResultadoEntrenamientoRead(ResultadoEntrenamientoBase):
    id: int
    external_id: UUID
    entrenamiento_id: int 
    atleta_id: int

    entrenamiento: Optional[EntrenamientoResponse] = None
    atleta: Optional[AtletaSimpleResponse] = None
    
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
