from sqlalchemy import Integer, ForeignKey
from typing import List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

if TYPE_CHECKING:
    from app.modules.entrenador.domain.models.horario_model import Horario
    from app.modules.atleta.domain.models.atleta_model import Atleta
    from app.modules.entrenador.domain.models.asistencia_model import Asistencia


class RegistroAsistencias(Base):
    __tablename__ = "registro_asistencias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        unique=True,
        index=True,
        default=uuid.uuid4,
        onupdate=uuid.uuid4
    )

    # FKs
    horario_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("horario.id"),
        nullable=False
    )
    atleta_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("atleta.id"),
        nullable=False
    )

    # Relationships
    horario: Mapped["Horario"] = relationship(
        "Horario",
        back_populates="registros_asistencias"
    )

    atleta: Mapped["Atleta"] = relationship("Atleta")

    asistencias: Mapped[List["Asistencia"]] = relationship(
        "Asistencia",
        back_populates="registro_asistencias",
        cascade="all, delete-orphan"
    )

