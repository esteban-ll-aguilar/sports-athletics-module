"""
Modelo de datos para el atleta.
"""

from sqlalchemy import Integer, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid
from typing import Optional, TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.modules.auth.domain.models.user_model import UserModel
    from app.modules.representante.domain.models.representante_model import Representante
    from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
    from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias


class Atleta(Base):
    __tablename__ = "atleta"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )

    anios_experiencia: Mapped[int] = mapped_column(Integer, nullable=False)

    # 🔗 User (1–1)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="atleta"
    )

    # 🔗 Representante (N–1)
    representante_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("representante.id"),
        nullable=True
    )

    representante: Mapped["Representante"] = relationship(
        "Representante",
        back_populates="atletas"
    )

    # 🔗 Asistencias (1–N)
    registros_asistencias: Mapped[List["RegistroAsistencias"]] = relationship(
        "RegistroAsistencias",
        back_populates="atleta",
        cascade="all, delete-orphan"
    )

    # 🔗 Historial médico (1–1)
    historial_medico: Mapped[Optional["HistorialMedico"]] = relationship(
        "HistorialMedico",
        back_populates="atleta",
        uselist=False,
        cascade="all, delete-orphan"
    )
