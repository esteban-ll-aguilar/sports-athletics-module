from sqlalchemy import Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel
    from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento


class Entrenador(Base):
    __tablename__ = "entrenador"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )

    is_pasante: Mapped[bool] = mapped_column(Boolean, default=False)
    anios_experiencia: Mapped[int] = mapped_column(Integer, nullable=False)

    # 🔗 Relación con AuthUser
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("auth_users.id"),
        nullable=False
    )

    user: Mapped["AuthUserModel"] = relationship(
        "AuthUserModel",
        back_populates="entrenador"
    )

    # 🔗 Entrenamientos (1–N)
    entrenamientos: Mapped[List["Entrenamiento"]] = relationship(
        "Entrenamiento",
        back_populates="entrenador",
        cascade="all, delete-orphan"
    )
