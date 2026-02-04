from pydantic import BaseModel
from typing import Optional


class ExampleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True