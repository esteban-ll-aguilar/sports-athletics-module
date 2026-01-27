from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class BaseResponse(BaseModel):
    """
    Schema estandarizado para las respuestas de las APIs.
    """
    summary: str = Field(..., description="Resumen breve de la operación")
    status_code: int = Field(..., description="Código de estado HTTP")
    errors: Dict[str, Any] = Field(default_factory=dict, description="Diccionario de errores")
    message: str = Field(..., description="Mensaje descriptivo de la operación")
    data: Dict[str, Any] = Field(default_factory=dict, description="Datos de respuesta")
    status: int = Field(..., description="Código de estado (duplicado para compatibilidad)")
    code: str = Field(..., description="Código de respuesta (COD_OK o COD_ERROR)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "summary": "Operación exitosa",
                "status_code": 200,
                "errors": {},
                "message": "La operación se completó correctamente",
                "data": {},
                "status": 200,
                "code": "OK"
            }
        }
