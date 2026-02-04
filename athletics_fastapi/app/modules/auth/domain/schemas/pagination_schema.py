"""
Paginación de usuarios para respuestas de API
"""
from pydantic import BaseModel
from typing import List
from app.modules.auth.domain.schemas.schemas_users import UserResponseSchema, UserWithRelationsSchema


class PaginatedUsers(BaseModel):
    items: List[UserResponseSchema]
    total: int
    page: int
    size: int
    pages: int


class PaginatedUsersWithRelations(BaseModel):
    items: List[UserWithRelationsSchema]
    total: int
    page: int
    size: int
    pages: int

