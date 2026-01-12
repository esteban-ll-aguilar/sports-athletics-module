from sqlalchemy import Integer, Time, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
    from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias


class Horario(Base):
    __tablename__ = "horario"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    external_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        default=uuid.uuid4
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

