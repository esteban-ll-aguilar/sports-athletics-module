from sqlalchemy import Integer, Time, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import List

class Horario(Base):
    __tablename__ = "horario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    name: Mapped[str] = mapped_column(String)
    hora_inicio: Mapped[Time] = mapped_column(Time)
    hora_fin: Mapped[Time] = mapped_column(Time)

    # FKs
    entrenamiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("entrenamiento.id"))

    # Relationships
    entrenamiento: Mapped["Entrenamiento"] = relationship("Entrenamiento", back_populates="horarios")
    registros_asistencias: Mapped[List["RegistroAsistencias"]] = relationship("RegistroAsistencias", back_populates="horario", cascade="all, delete-orphan")
