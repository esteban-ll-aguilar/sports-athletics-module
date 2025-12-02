from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class RegistroAsistencias(Base):
    __tablename__ = "registro_asistencias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)

    # FKs
    horario_id: Mapped[int] = mapped_column(Integer, ForeignKey("horario.id"))
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"))
    asistencia_id: Mapped[int] = mapped_column(Integer, ForeignKey("asistencia.id"))

    # Relationships
    horario: Mapped["Horario"] = relationship("Horario", back_populates="registros_asistencias")
    atleta: Mapped["Atleta"] = relationship("Atleta")
    asistencia: Mapped["Asistencia"] = relationship("Asistencia", back_populates="registros_asistencias")
