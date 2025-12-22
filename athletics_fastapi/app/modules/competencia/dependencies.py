from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db.database import get_session
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.enums.role_enum import RoleEnum

from app.modules.competencia.repositories.baremo_repository import BaremoRepository
from app.modules.competencia.services.baremo_service import BaremoService


# ============================
# Servicio Baremo (CRUD)
# ============================
async def get_baremo_service(
    session: AsyncSession = Depends(get_session)
) -> BaremoService:
    repo = BaremoRepository(session)
    return BaremoService(repo)


# ============================
# Seguridad: Admin o Entrenador
# ============================
async def get_current_admin_or_entrenador(
    current_user = Depends(get_current_user)
):
    if current_user.role not in (
        RoleEnum.ADMINISTRADOR,
        RoleEnum.ENTRENADOR
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para esta acción"
        )
    return current_user
