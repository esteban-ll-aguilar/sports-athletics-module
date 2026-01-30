from sqlalchemy import Integer, String, Time, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    pass


class Horario(Base):
    __tablename__ = "horario"

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

    name: Mapped[str] = mapped_column(String, nullable=False)
    hora_inicio: Mapped[Time] = mapped_column(Time, nullable=False)
    hora_fin: Mapped[Time] = mapped_column(Time, nullable=False)

    # 🔗 FK Entrenamiento
    entrenamiento_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("entrenamiento.id"),
        nullable=False
    )

    # 🔗 Relaciones
    entrenamiento: Mapped["Entrenamiento"] = relationship(
        "Entrenamiento",
        back_populates="horarios"
    )

    registros_asistencias: Mapped[List["RegistroAsistencias"]] = relationship(
        "RegistroAsistencias",
        back_populates="horario",
        cascade="all, delete-orphan"
    )

