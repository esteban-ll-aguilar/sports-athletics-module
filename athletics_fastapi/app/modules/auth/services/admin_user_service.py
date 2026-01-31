from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select

from app.modules.auth.repositories.auth_users_repository import AuthUsersRepository
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.schemas.schemas_auth import AdminUserUpdateRequest

from app.modules.atleta.domain.models.atleta_model import Atleta
from app.modules.entrenador.domain.models.entrenador_model import Entrenador
from app.modules.representante.domain.models.representante_model import Representante


class AdminUserService:
    def __init__(self, users_repo: AuthUsersRepository):
        self.users_repo = users_repo

    # =====================================================
    # UPDATE USER ROLE
    # =====================================================
    async def update_user_role(self, user_id: str, new_role: RoleEnum):
        """
        Actualiza el rol de un usuario y crea su perfil asociado si no existe.
        
        Dependiendo del nuevo rol (ATLETA, ENTRENADOR, REPRESENTANTE), verifica si ya existe
        un perfil en la tabla correspondiente. Si no, lo crea con valores por defecto.
        
        Args:
            user_id (str): ID o Username del usuario a modificar.
            new_role (RoleEnum): Nuevo rol a asignar.
            
        Returns:
            dict: {
                "success": bool,
                "message": str (solo en error),
                "status_code": int (solo en error),
                "user": UserModel (en éxito)
            }
        """

        user = await self.users_repo.get_by_any_id(user_id)

        if not user:
            return {
                "success": False,
                "message": "Usuario no encontrado",
                "status_code": 404
            }

        # Actualizar rol
        user.role = new_role

        # =========================
        # ATLETA
        # =========================
        if new_role == RoleEnum.ATLETA:
            result = await self.users_repo.db.execute(
                select(Atleta).where(Atleta.user_id == user.id)
            )
            atleta = result.scalar_one_or_none()

            if not atleta:
                self.users_repo.db.add(
                    Atleta(user_id=user.id, anios_experiencia=0)
                )

        # =========================
        # ENTRENADOR
        # =========================
        elif new_role == RoleEnum.ENTRENADOR:
            result = await self.users_repo.db.execute(
                select(Entrenador).where(Entrenador.user_id == user.id)
            )
            entrenador = result.scalar_one_or_none()

            if not entrenador:
                self.users_repo.db.add(
                    Entrenador(user_id=user.id, anios_experiencia=0)
                )

        # =========================
        # REPRESENTANTE
        # =========================
        elif new_role == RoleEnum.REPRESENTANTE:
            result = await self.users_repo.db.execute(
                select(Representante).where(Representante.user_id == user.id)
            )
            representante = result.scalar_one_or_none()

            if not representante:
                self.users_repo.db.add(
                    Representante(user_id=user.id)
                )

        await self.users_repo.db.commit()
        await self.users_repo.db.refresh(user)

        return {
            "success": True,
            "user": user
        }

    # =====================================================
    # GET ALL USERS
    # =====================================================
    async def get_all_users(
        self,
        page: int = 1,
        size: int = 20,
        role: Optional[RoleEnum] = None
    ):
        """
        Obtiene una lista paginada de todos los usuarios del sistema.
        
        Permite filtrar por rol.
        
        Args:
            page (int): Número de página actual.
            size (int): Cantidad de items por página.
            role (Optional[RoleEnum]): Filtro opcional por rol de usuario.
            
        Returns:
            dict: Objeto paginado con items, total, página actual, etc.
        """
        users, total = await self.users_repo.get_paginated(
            page=page,
            size=size,
            role=role
        )
        print(f"DTO DEBUG: Users found: {len(users)}, Total: {total}")

        return {
            "items": users,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }

    # =====================================================
    # ADMIN UPDATE USER (SIN CAMBIAR ROL)
    # =====================================================
    async def update_user_by_id(
        self,
        user_id: str,
        data: AdminUserUpdateRequest
    ):
        """
        Actualiza la información básica de un usuario (Admin operation).
        
        No modifica el rol en esta operación, solo datos personales y de cuenta.
        
        Args:
            user_id (str): ID único del usuario.
            data (AdminUserUpdateRequest): Objeto con los campos a actualizar.
            
        Returns:
            UserModel: El usuario actualizado.
            
        Raises:
            HTTPException: 404 si el usuario no existe.
        """
        user = await self.users_repo.get_by_any_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        if data.username is not None:
            user.username = data.username

        if data.email is not None:
            user.auth.email = data.email

        if data.is_active is not None:
            user.auth.is_active = data.is_active

        if data.profile_image is not None:
            user.profile_image = data.profile_image

        await self.users_repo.db.commit()
        await self.users_repo.db.refresh(user)

        return user