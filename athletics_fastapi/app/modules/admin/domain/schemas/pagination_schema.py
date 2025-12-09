from app.modules.auth.domain.schemas import UserRead
from pydantic import BaseModel

class PaginatedUsers(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    size: int
    pages: int