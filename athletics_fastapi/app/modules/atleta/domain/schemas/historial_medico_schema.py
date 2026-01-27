from enum import Enum
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator

class TipoAlergia(str, Enum):
    NINGUNA = "Ninguna"
    PENICILINA = "Penicilina"
    SULFAMIDAS = "Sulfamidas"
    POLVO_ACAROS = "Polvo/Ácaros"
    POLEN = "Polen"
    ALIMENTARIA_FRUTOS_SECOS = "Alimentos (Frutos secos)"
    ALIMENTARIA_LACTOSA = "Alimentos (Lactosa)"
    ALIMENTARIA_GLUTEN = "Alimentos (Gluten)"
    PICADURAS_INSECTOS = "Picaduras de insectos"
    OTRA = "Otra"

class TipoEnfermedadHereditaria(str, Enum):
    NINGUNA = "Ninguna"
    DIABETES = "Diabetes"
    HIPERTENSION = "Hipertensión Arterial"
    CARDIOPATIAS = "Cardiopatías"
    ASMA = "Asma"
    CANCER = "Cáncer"
    ARTRITIS = "Artritis"
    OTRA = "Otra"

class TipoEnfermedad(str, Enum):
    NINGUNA = "Ninguna"
    ASMA_BRONQUIAL = "Asma Bronquial"
    ANEMIA = "Anemia"
    GASTRITIS = "Gastritis"
    DIABETES_TIPO_1 = "Diabetes Tipo 1"
    DIABETES_TIPO_2 = "Diabetes Tipo 2"
    HIPERTENSION = "Hipertensión"
    MIGRAÑA = "Migraña"
    OTRA = "Otra"


class HistorialMedicoBase(BaseModel):
    talla: float = Field(..., description="Talla en metros")
    peso: float = Field(..., description="Peso en kg")
    imc: Optional[float] = Field(None, description="Índice de masa corporal")
    

    alergias: Optional[TipoAlergia] = Field(
        default=TipoAlergia.NINGUNA, 
        description="Alergias conocidas"
    )
    enfermedades_hereditarias: Optional[TipoEnfermedadHereditaria] = Field(
        default=TipoEnfermedadHereditaria.NINGUNA, 
        description="Antecedentes familiares"
    )
    enfermedades: Optional[TipoEnfermedad] = Field(
        default=TipoEnfermedad.NINGUNA, 
        description="Enfermedades actuales"
    )

    # Mantenemos tus validadores (son importantes para evitar divisiones por cero o datos locos)
    @field_validator('talla')
    @classmethod
    def validar_talla(cls, v):
        if not (0.5 <= v <= 2.50):
            raise ValueError('Talla irreal')
        return v

    @field_validator('peso')
    @classmethod
    def validar_peso(cls, v):
        if not (20 <= v <= 200):
            raise ValueError('Peso irreal')
        return v

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
    atleta_id: int

    model_config = ConfigDict(from_attributes=True)
