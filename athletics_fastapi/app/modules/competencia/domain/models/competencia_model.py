"""Modelo de Competencia."""
from sqlalchemy import Integer, String, Date, Boolean, ForeignKey, DateTime, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.auth.domain.models.user_model import UserModel
    from app.modules.competencia.domain.models.resultado_competencia_model import ResultadoCompetencia


class Competencia(Base):
    """
    Entidad principal que representa un evento deportivo o jornada de evaluación.
    
    Almacena la información logística de la competencia y actúa como contenedor 
    para los resultados individuales de los atletas bajo la supervisión de un entrenador.
    """
    __tablename__ = "competencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")

    )
    #Identificadores
    nombre: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    lugar: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    
    # Relación con el entrenador que registra la competencia
    entrenador_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    entrenador: Mapped["UserModel"] = relationship("UserModel")
    
    # Marcas de tiempo
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow)
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow)
    
    # Relaciones
    resultados: Mapped[list["ResultadoCompetencia"]] = relationship(
        "ResultadoCompetencia",
        back_populates="competencia",
        cascade="all, delete-orphan"
    )
