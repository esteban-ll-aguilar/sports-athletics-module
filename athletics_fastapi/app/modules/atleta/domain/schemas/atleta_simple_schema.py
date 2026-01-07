from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserSimpleSchema(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    identificacion: Optional[str] = None
    email: str

    model_config = ConfigDict(from_attributes=True)

class AtletaSimpleResponse(BaseModel):
    id: int
    anios_experiencia: Optional[int] = 0
    user_id: int
    user: Optional[UserSimpleSchema] = None

    model_config = ConfigDict(from_attributes=True)
