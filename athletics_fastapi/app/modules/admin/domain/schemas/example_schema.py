from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ExampleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: Optional[bool] = True