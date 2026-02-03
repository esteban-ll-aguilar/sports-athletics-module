from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db.database import get_session
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.core.jwt.jwt import get_current_user
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.entrenador.repositories.entrenador_repository import EntrenadorRepository
from app.modules.entrenador.repositories.entrenamiento_repository import EntrenamientoRepository
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.entrenador.repositories.horario_repository import HorarioRepository
from app.modules.entrenador.services.horario_service import HorarioService


async def get_entrenador_repo(session: AsyncSession = Depends(get_session)) -> EntrenadorRepository:
    return EntrenadorRepository(session)

async def get_current_entrenador(
    current_user: AuthUserModel = Depends(get_current_user),
    entrenador_repo: EntrenadorRepository = Depends(get_entrenador_repo)
) -> Entrenador:
    
    # 1. Verificar Rol
    if current_user.profile.role not in [RoleEnum.ENTRENADOR, RoleEnum.PASANTE]:
        # Nota: Si se permite que admin actúe como entrenador, ajustar aquí.
        # Por ahora estricto a que tenga el rol.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Entrenador"
        )

    # 2. Buscar Entrenador
    entrenador = await entrenador_repo.get_by_user_id(current_user.profile.id)

    # 3. Auto-creación si no existe
    if not entrenador:
        new_entrenador = Entrenador(
            user_id=current_user.profile.id,
            anios_experiencia=0,
            is_pasante=(current_user.profile.role == RoleEnum.PASANTE)
            # Otros campos opcionales van por defecto o nulos
        )
        entrenador = await entrenador_repo.create(new_entrenador)

    return entrenador

async def get_entrenamiento_repo(session: AsyncSession = Depends(get_session)) -> EntrenamientoRepository:
    return EntrenamientoRepository(session)


async def get_horario_repo(session: AsyncSession = Depends(get_session)) -> HorarioRepository:
    return HorarioRepository(session)

async def get_horario_service(
    repo: HorarioRepository = Depends(get_horario_repo),
    entrenamiento_repo: EntrenamientoRepository = Depends(get_entrenamiento_repo)
) -> HorarioService:
    return HorarioService(repo, entrenamiento_repo)
