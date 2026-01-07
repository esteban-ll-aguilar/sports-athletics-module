from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Text, func, Date, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid, datetime
from typing import TYPE_CHECKING, Optional
from app.modules.auth.domain.enums import TipoEstamentoEnum, TipoIdentificacionEnum, RoleEnum, SexoEnum

if TYPE_CHECKING:
    from .auth_users_sessions_model import AuthUsersSessionsModel
    from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico

class AuthUserModel(Base):
    __tablename__ = "auth_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(75), unique=True, nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(17), nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    email_confirmed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 2FA Fields
    totp_secret: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    two_factor_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    totp_backup_codes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())

    # Relationship with user sessions
    sessions: Mapped[list["AuthUsersSessionsModel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # Common Profile Fields
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    tipo_identificacion: Mapped[TipoIdentificacionEnum] = mapped_column(
        Enum(TipoIdentificacionEnum),
        nullable=False,
        index=True,
        default=TipoIdentificacionEnum.CEDULA,
        server_default=TipoIdentificacionEnum.CEDULA.value
    )

    tipo_estamento: Mapped[TipoEstamentoEnum] = mapped_column(
        Enum(TipoEstamentoEnum),
        nullable=False,
        index=True,
        default=TipoEstamentoEnum.EXTERNOS,
        server_default=TipoEstamentoEnum.EXTERNOS.value
    )

    identificacion: Mapped[str] = mapped_column(String, nullable=False, index=True, unique=True)
    direccion: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    fecha_nacimiento: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    sexo: Mapped[SexoEnum] = mapped_column(
        Enum(SexoEnum),
        nullable=True,
        default=SexoEnum.M,
        server_default=SexoEnum.M.value
    )
    external_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        default=uuid.uuid4,
        onupdate=uuid.uuid4
    )

    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum),
        nullable=False,
        default=RoleEnum.ATLETA,
        index=True,
        server_default=RoleEnum.ATLETA.value
    )

    # -------------------------------------------------
    # Relación con HistorialMedico solo para ATLETAS
    # -------------------------------------------------
     # Relación con HistorialMedico
    historial_medico = relationship(
        "HistorialMedico",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    registros_prueba = relationship(
    "RegistroPruebaCompetencia",
    back_populates="auth_user"
    )
