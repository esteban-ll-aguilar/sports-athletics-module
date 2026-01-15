from sqlalchemy import Integer, Boolean, ForeignKey, UUID as PG_UUID, text, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid
from typing import TYPE_CHECKING
from enum import Enum as PyEnum


# 👇 SOLO para tipado (evita import circular)
if TYPE_CHECKING:
    from app.modules.competencia.domain.models.competencia_model import Competencia
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel


class RegistroPruebaCompetencia(Base):
    __tablename__ = "registro_prueba_competencia"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")

    )

    id_entrenador: Mapped[int] = mapped_column(Integer)
    valor: Mapped[float] = mapped_column(Float)
    fecha_registro: Mapped[Date] = mapped_column(Date)

    # 🔗 Foreign Keys
    prueba_id: Mapped[int] = mapped_column(
        ForeignKey("prueba.id"),
        nullable=False
    )

    auth_user_id: Mapped[int] = mapped_column(
        ForeignKey("auth_users.id"),
        nullable=False
    )

    # 🔗 Relationships
    prueba: Mapped["Prueba"] = relationship("Prueba")

    auth_user: Mapped["AuthUserModel"] = relationship(
        "AuthUserModel"
    )
