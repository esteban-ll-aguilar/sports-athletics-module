from pydantic import BaseModel
from app.modules.auth.domain.enums.role_enum import RoleEnum

class UserRoleUpdate(BaseModel):
    role: RoleEnum
