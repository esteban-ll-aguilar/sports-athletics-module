from pydantic import BaseModel
from typing import List
from .schemas_auth import UserRead
from uuid import UUID

class UsersPaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    users: list[UserRead]

class UserGet(BaseModel):
    external_id: UUID
