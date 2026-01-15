from sqlalchemy import Integer, String, Date, Time, ForeignKey, text, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.entrenador.domain.models.entrenador_model import Entrenador
    from app.modules.entrenador.domain.models.registro_asistencias_model import RegistroAsistencias


class Asistencia(Base):
    __tablename__ = "asistencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    fecha_asistencia: Mapped[Date] = mapped_column(Date)
    hora_llegada: Mapped[Time] = mapped_column(Time)
    descripcion: Mapped[str] = mapped_column(String)

    # FK
    registro_asistencias_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("registro_asistencias.id"),
        nullable=False
    )

    # Relationship
    registro_asistencias: Mapped["RegistroAsistencias"] = relationship(
        "RegistroAsistencias",
        back_populates="asistencias"
    )
