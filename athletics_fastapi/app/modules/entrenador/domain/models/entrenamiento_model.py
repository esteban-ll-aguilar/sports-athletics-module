from sqlalchemy import Integer, String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import List

class Entrenamiento(Base):
    __tablename__ = "entrenamiento"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    tipo_entrenamiento: Mapped[str] = mapped_column(String)
    descripcion: Mapped[str] = mapped_column(String)
    fecha_entrenamiento: Mapped[Date] = mapped_column(Date)

    # FKs
    entrenador_id: Mapped[int] = mapped_column(Integer, ForeignKey("entrenador.id"))

    # Relationships
    entrenador: Mapped["Entrenador"] = relationship("Entrenador", back_populates="entrenamientos")
    horarios: Mapped[List["Horario"]] = relationship("Horario", back_populates="entrenamiento")
