from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class HistorialMedicoBase(BaseModel):
    talla: float = Field(..., description="Talla en metros")
    peso: float = Field(..., description="Peso en kg")
    imc: float = Field(..., description="Índice de masa corporal")
    alergias: Optional[str] = None
    enfermedades_hereditarias: Optional[str] = None
    enfermedades: Optional[str] = None


# ❌ NO user_id
class HistorialMedicoCreate(HistorialMedicoBase):
    pass


class HistorialMedicoUpdate(BaseModel):
    talla: Optional[float] = None
    peso: Optional[float] = None
    imc: Optional[float] = None
    alergias: Optional[str] = None
    enfermedades_hereditarias: Optional[str] = None
    enfermedades: Optional[str] = None


class HistorialMedicoRead(HistorialMedicoBase):
    id: int
    external_id: UUID
    auth_user_id: int

    class Config:
        from_attributes = True  # Pydantic v2
