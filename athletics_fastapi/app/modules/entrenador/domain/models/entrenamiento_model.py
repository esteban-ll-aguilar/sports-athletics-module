from sqlalchemy import Date, Integer, String, Time, ForeignKey, UUID as PG_UUID, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.modules.entrenador.domain.models.entrenador_model import Entrenador
    from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias


class Entrenamiento(Base):
    __tablename__ = "entrenamiento"

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
    tipo_entrenamiento: Mapped[str] = mapped_column(String, nullable=False)
    descripcion: Mapped[str] = mapped_column(String, nullable=True)
    fecha_entrenamiento: Mapped[Date] = mapped_column(Date, nullable=False)

    # 🔗 FK Entrenador
    entrenador_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("entrenador.id"),
        nullable=False
    )

    # 🔗 Relaciones
    entrenador: Mapped["Entrenador"] = relationship(
        "Entrenador",
        back_populates="entrenamientos"
    )

    horarios: Mapped[List["Horario"]] = relationship(
        "Horario",
        back_populates="entrenamiento",
        cascade="all, delete-orphan"
    )
