"""Modelo de Competencia."""
from sqlalchemy import Integer, String, Date, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.auth.domain.models.user_model import UserModel
    from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia


class Competencia(Base):
    __tablename__ = "competencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    lugar: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Relación con el entrenador que registra la competencia
    entrenador_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    entrenador: Mapped["UserModel"] = relationship("UserModel")
    
    # Timestamps
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow)
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    resultados: Mapped[list["ResultadoCompetencia"]] = relationship(
        "ResultadoCompetencia",
        back_populates="competencia",
        cascade="all, delete-orphan"
    )
