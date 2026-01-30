from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class ResultadoPruebaBase(BaseModel):
    marca_obtenida: float
    clasificacion_final: Optional[str] = None
    estado: bool = True
    fecha: datetime

class ResultadoPruebaCreate(ResultadoPruebaBase):
    atleta_id: UUID
    prueba_id: UUID
    # No competence_id needed

class ResultadoPruebaUpdate(BaseModel):
    marca_obtenida: Optional[float] = None
    unidad_medida: Optional[str] = None
    posicion_final: Optional[str] = None
    clasificacion_final: Optional[str] = None
    observaciones: Optional[str] = None
    estado: Optional[bool] = None
    fecha: Optional[datetime] = None

class ResultadoPruebaRead(ResultadoPruebaBase):
    id: int
    external_id: UUID
    atleta_id: int
    prueba_id: int
    baremo_id: int
    
    fecha_creacion: datetime
    fecha_actualizacion: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    @property
    def atleta_user_id(self) -> Optional[int]:
        """Get the user_id from the related atleta"""
        if hasattr(self, '_atleta') and self._atleta and hasattr(self._atleta, 'user_id'):
            return self._atleta.user_id
        return None
