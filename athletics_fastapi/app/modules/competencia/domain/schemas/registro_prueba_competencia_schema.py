from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from uuid import UUID
from typing import List, Optional

class RegistroPruebaCompetenciaBase(BaseModel):
    """
    Atributos base para el registro de una marca obtenida por un atleta.
    """
    prueba_id: int = Field(..., json_schema_extra={"example": 1})
    auth_user_id: int = Field(..., json_schema_extra={"example": 10})
    id_entrenador: int = Field(..., json_schema_extra={"example": 5})
    valor: float = Field(..., json_schema_extra={"example": 10.35})
    fecha_registro: date = Field(..., json_schema_extra={"example": "2025-01-01"})


class RegistroPruebaCompetenciaCreate(RegistroPruebaCompetenciaBase):
    """
    Esquema para la creación de un nuevo registro de rendimiento.
    """
    pass

class RegistroPruebaCompetenciaUpdate(BaseModel):
    """
    Permite la modificación parcial de una marca o su fecha de registro.
    """
    valor: Optional[float] = Field(None, json_schema_extra={"example": 10.50})
    fecha_registro: Optional[date] = Field(None, json_schema_extra={"example": "2025-01-02"})

class RegistroPruebaCompetenciaResponse(RegistroPruebaCompetenciaBase):
    """
    Esquema de respuesta detallado que incluye identificadores únicos.
    """
    id: int
    external_id: UUID

    model_config = ConfigDict(from_attributes=True)

class RegistroPruebaCompetenciaList(BaseModel):
    """
    Esquema diseñado para respuestas paginadas o listados masivos.
    """
    items: List[RegistroPruebaCompetenciaResponse]
    total: int