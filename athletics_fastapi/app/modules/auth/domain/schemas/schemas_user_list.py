from pydantic import BaseModel
from typing import List
from .schemas_auth import UserRead

class UsersPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: list[UserRead]
