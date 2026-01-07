from sqlalchemy import Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import List

class Asistencia(Base):
    __tablename__ = "asistencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    fecha_asistencia: Mapped[Date] = mapped_column(Date)
    hora_llegada: Mapped[Time] = mapped_column(Time)
    descripcion: Mapped[str] = mapped_column(String)

    # FK
    registro_asistencias_id: Mapped[int] = mapped_column(Integer, ForeignKey("registro_asistencias.id"))

    # Relationships
    registro_asistencias: Mapped["RegistroAsistencias"] = relationship("RegistroAsistencias", back_populates="asistencias")
