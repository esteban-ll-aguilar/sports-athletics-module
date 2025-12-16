from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Text, JSON, func, Date, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid, datetime
from typing import TYPE_CHECKING
from app.modules.auth.domain.enums.role_enum import RoleEnum
from app.modules.auth.domain.enums import TipoEstamentoEnum, TipoIdentificacionEnum

if TYPE_CHECKING:
    from .auth_users_sessions_model import AuthUsersSessionsModel


class AuthUserModel(Base):
    __tablename__ = "auth_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(75), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(17), nullable=True)
    profile_image: Mapped[str] = mapped_column(Text, nullable=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    email_confirmed_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # 2FA Fields
    totp_secret: Mapped[str] = mapped_column(String(32), nullable=True)  # Secret para TOTP
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    totp_backup_codes: Mapped[str] = mapped_column(Text, nullable=True)  # JSON array de códigos hasheados
    
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    # Relationship with user sessions
    sessions: Mapped[list["AuthUsersSessionsModel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # Common Profile Fields
    username: Mapped[str] = mapped_column(String, nullable=True)
    first_name: Mapped[str] = mapped_column(String, nullable=True)
    last_name: Mapped[str] = mapped_column(String, nullable=True)

    tipo_identificacion: Mapped[TipoIdentificacionEnum] = mapped_column(Enum(TipoIdentificacionEnum), nullable=False, index=True, default=TipoIdentificacionEnum.CEDULA, server_default=TipoIdentificacionEnum.CEDULA.value) # Storing Enum as String
    tipo_estamento: Mapped[TipoEstamentoEnum] = mapped_column(Enum(TipoEstamentoEnum), nullable=False, index=True, default=TipoEstamentoEnum.EXTERNOS, server_default=TipoEstamentoEnum.EXTERNOS.value) # Storing Enum as String

    identificacion: Mapped[str] = mapped_column(String, nullable=False, index=True, unique=True)
    direccion: Mapped[str] = mapped_column(String, nullable=True)

    fecha_nacimiento: Mapped[datetime.date] = mapped_column(Date, nullable=True)
    sexo: Mapped[str] = mapped_column(String, nullable=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False, default=RoleEnum.ATLETA, index=True, server_default=RoleEnum.ATLETA.value)
