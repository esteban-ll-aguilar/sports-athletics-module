from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

# Schema base que puede ser heredado por Create y Update
class HistorialMedicoBase(BaseModel):
    talla: float = Field(..., description="Talla del atleta en metros")
    peso: float = Field(..., description="Peso del atleta en kg")
    imc: float = Field(..., description="Índice de masa corporal")
    alergias: Optional[str] = Field(None, description="Alergias del atleta")
    enfermedades_hereditarias: Optional[str] = Field(None, description="Enfermedades hereditarias")
    enfermedades: Optional[str] = Field(None, description="Otras enfermedades")


# Schema para creación
class HistorialMedicoCreate(HistorialMedicoBase):
    user_id: int = Field(..., description="ID del usuario atleta al que pertenece el historial")


# Schema para actualización
class HistorialMedicoUpdate(HistorialMedicoBase):
    pass  # Todos los campos opcionales se pueden actualizar


# Schema para lectura
class HistorialMedicoRead(HistorialMedicoBase):
    id: int
    external_id: UUID
    user_id: int

    class Config:
        orm_mode = True
