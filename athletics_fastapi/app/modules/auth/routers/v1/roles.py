from fastapi import APIRouter, status
from app.modules.auth.domain.enums.role_enum import RoleEnum
from pydantic import BaseModel

roles_router_v1 = APIRouter()

class RoleResponse(BaseModel):
    """Schema para respuesta de roles."""
    value: str
    label: str
    description: str

@roles_router_v1.get("/roles", response_model=list[RoleResponse], status_code=status.HTTP_200_OK)
async def get_available_roles():
    """
    Retorna la lista de roles disponibles en el sistema.
    Excluye el rol ADMINISTRADOR (solo para registro manual).
    """
    roles = [
        {
            "value": RoleEnum.ATLETA.value,
            "label": "Atleta",
            "description": "Usuario deportista que participa en competencias"
        },
        {
            "value": RoleEnum.REPRESENTANTE.value,
            "label": "Representante",
            "description": "Representante legal o tutor de un atleta"
        },
        {
            "value": RoleEnum.ENTRENADOR.value,
            "label": "Entrenador",
            "description": "Profesional que entrena y guía a los atletas"
        }
    ]
    
    return roles
