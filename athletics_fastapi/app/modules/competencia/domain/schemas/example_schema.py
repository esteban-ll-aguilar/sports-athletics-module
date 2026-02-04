from pydantic import BaseModel
from typing import Optional


class ExampleCreate(BaseModel):
    """
    Esquema para la creación de un nuevo recurso de ejemplo.
    
    Define los campos necesarios que el cliente debe enviar a la API
    para inicializar una entidad en el sistema.
    """
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True