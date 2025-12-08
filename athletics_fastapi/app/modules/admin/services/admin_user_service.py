from fastapi import HTTPException, status
from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum

class AdminUserService:
    def __init__(self, users_repo: AuthUsersRepository):
        self.users_repo = users_repo

    async def update_user_role(self, user_id: int, new_role: RoleEnum):
        # El repositorio espera str pero maneja int si se pasa int (aunque tiene logica de UUID para str)
        # Asumimos que user_id es int ya que el modelo usa Integer
        user = await self.users_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        
        user.role = new_role
        await self.users_repo.session.commit()
        return user
