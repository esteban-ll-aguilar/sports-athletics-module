"""
Paginacion de usuarios para respuestas de API
"""
from app.modules.auth.domain.schemas.schemas_auth import UserRead
from pydantic import BaseModel
#define el esquema de paginación para usuarios
# incluye la lista de usuarios, total, página actual, tamaño de página y total de páginas
class PaginatedUsers(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    size: int 
    pages: int