from pydantic import BaseModel, Field, ConfigDict
from enum import Enum
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from pydantic import field_validator

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

    model_config = ConfigDict(from_attributes=True)

# -----------------------------
# Resultado Competencia Schemas
# -----------------------------
class ResultadoCompetenciaBase(BaseModel):
    resultado: float
    unidad_medida: str = "METROS"
    posicion_final: str
    puesto_obtenido: Optional[int] = None
    observaciones: Optional[str] = None
    estado: bool = True

class UnidadMedidaEnum(str, Enum):
    SEGUNDOS = "SEGUNDOS"
    METROS = "METROS"
    PUNTOS = "PUNTOS"
    MINUTOS = "MINUTOS"
    KILOMETROS = "KILOMETROS"
    CENTIMETROS = "CENTIMETROS"

class ResultadoCompetenciaCreate(BaseModel):
    """Schema para crear Resultado. IDs vienen como UUID desde el frontend."""
    # IDs externos (UUIDs)
    competencia_id: UUID
    atleta_id: UUID
    prueba_id: UUID

    # Datos del resultado
    resultado: float
    unidad_medida: UnidadMedidaEnum = Field(
        default=UnidadMedidaEnum.METROS, 
        description="Unidad de medida (SEGUNDOS, METROS, PUNTOS)"
    )
    posicion_final: str
    puesto_obtenido: Optional[int] = Field(None, description="Lugar en la competencia (1, 2, 3...)")
    observaciones: Optional[str] = None
    estado: bool = True

    @field_validator('resultado')
    @classmethod
    def validar_resultado_positivo(cls, v):
        if v < 0:
            raise ValueError('El resultado no puede ser negativo')
        return v

    @field_validator('puesto_obtenido')
    @classmethod
    def validar_puesto(cls, v):
        # Si el valor es None, no validamos nada (porque es Optional)
        if v is not None and v <= 0:
            raise ValueError('El puesto obtenido debe ser mayor a 0')
        return v

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

    model_config = ConfigDict(from_attributes=True)
