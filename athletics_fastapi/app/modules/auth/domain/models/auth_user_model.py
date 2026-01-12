from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Text, func, Integer
from app.core.db.database import Base
from typing import Optional, TYPE_CHECKING
import datetime

if TYPE_CHECKING:
    from .auth_users_sessions_model import AuthUsersSessionsModel
    from .auth_user_model import UserModel


class AuthUserModel(Base):
    __tablename__ = "auth_users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )

    email: Mapped[str] = mapped_column(
        String(75), unique=True, nullable=False, index=True
    )

    hashed_password: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, index=True
    )

    email_confirmed_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # -------- 2FA --------
    totp_secret: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True
    )

    two_factor_enabled: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    totp_backup_codes: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )

    # -------- Auditoría --------
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=func.now()
    )

    updated_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=func.now()
    )

    # -------- Relaciones --------
    sessions: Mapped[list["AuthUsersSessionsModel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    profile: Mapped["UserModel"] = relationship( # type: ignore
        back_populates="auth",
        uselist=False,
        cascade="all, delete-orphan",
        foreign_keys="[UserModel.auth_user_id]"
    )
