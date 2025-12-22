from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from typing import List, TYPE_CHECKING

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

    # Relación con AuthUser
    user_id: Mapped[int] = mapped_column(
        ForeignKey("auth_users.id"),
        nullable=False
    )
    user: Mapped["AuthUserModel"] = relationship("AuthUserModel")

    # Relación 1–N con Atleta
    atletas: Mapped[List["Atleta"]] = relationship(
        "Atleta",
        back_populates="representante"
    )
