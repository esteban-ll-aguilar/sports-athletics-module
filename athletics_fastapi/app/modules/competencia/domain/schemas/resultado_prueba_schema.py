from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class ResultadoPruebaBase(BaseModel):
    """
    Datos base del rendimiento técnico de un atleta en una prueba.
    """
    marca_obtenida: float
    clasificacion_final: Optional[str] = None
    estado: bool = True
    fecha: datetime

class ResultadoPruebaCreate(ResultadoPruebaBase):
    """
    Esquema para crear un nuevo resultado usando identificadores externos (UUID).
    """
    atleta_id: UUID
    prueba_id: UUID
    # No competence_id needed

class ResultadoPruebaUpdate(BaseModel):
    """
    Esquema flexible para la edición parcial de un resultado y sus observaciones.
    """
    marca_obtenida: Optional[float] = None
    unidad_medida: Optional[str] = None
    posicion_final: Optional[str] = None
    clasificacion_final: Optional[str] = None
    observaciones: Optional[str] = None
    estado: Optional[bool] = None
    fecha: Optional[datetime] = None

class ResultadoPruebaRead(ResultadoPruebaBase):
    """
    Modelo de lectura que expone información completa y resuelve relaciones internas.    """
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
        """
        Retorna el identificador del usuario asociado al atleta.
        Esta propiedad permite acceder al `user_id` del atleta relacionado
        sin exponer directamente la entidad completa. 
        """
        if hasattr(self, '_atleta') and self._atleta and hasattr(self._atleta, 'user_id'):
            return self._atleta.user_id
        return None
