from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, Boolean, DateTime, String, text, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.db.database import Base
import datetime
import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .auth_user_model import AuthUserModel


class AuthUsersSessionsModel(Base):
    __tablename__ = "auth_users_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )

    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("auth_users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    access_token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    refresh_token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationship with user
    user: Mapped["AuthUserModel"] = relationship(back_populates="sessions")