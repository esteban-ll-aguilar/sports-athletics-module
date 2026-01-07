
"""
    Esquema para actualizar el rol de un usuario
    se utiliza pydantic para la validación de datos
    además se importa RoleEnum para definir los roles posibles

"""

from pydantic import BaseModel
from app.modules.auth.domain.enums.role_enum import RoleEnum
# Esquema para actualizar el rol de un usuario
class UserRoleUpdate(BaseModel):
    role: RoleEnum 
