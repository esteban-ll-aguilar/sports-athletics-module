from pydantic import BaseModel
from typing import Optional, List

class BaseResponse(BaseModel):
    """
    Schema para la respuesta de un modelo
    """
    data: dict
    message: str
    errors: Optional[List[str]]
    status: int
