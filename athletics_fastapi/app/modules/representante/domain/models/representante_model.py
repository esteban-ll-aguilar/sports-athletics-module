from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from typing import List, TYPE_CHECKING

from app.modules.auth.domain.models.user_model import UserModel

if TYPE_CHECKING:
    from app.modules.atleta.domain.models.atleta_model import Atleta


class Representante(Base):
    __tablename__ = "representante"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    # 🔗 Relación 1–1 con User (NO Auth)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="representante"
    )

    # 🔗 Relación 1–N con Atleta
    atletas: Mapped[List["Atleta"]] = relationship(
        "Atleta",
        back_populates="representante"
    )
