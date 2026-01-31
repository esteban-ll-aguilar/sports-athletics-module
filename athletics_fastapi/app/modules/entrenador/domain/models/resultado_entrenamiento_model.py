"""Modelo de Resultado de Entrenamiento. """
from sqlalchemy import Integer, String, Float, Boolean, ForeignKey, DateTime, text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.entrenador.domain.models.entrenamiento_model import Entrenamiento
    from app.modules.atleta.domain.models.atleta_model import Atleta

class ResultadoEntrenamiento(Base):
    __tablename__ = "resultados_entrenamientos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()")
    )
    
    # FKs
    entrenamiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("entrenamiento.id"), nullable=False)
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"), nullable=False)
    
    # Datos
    fecha: Mapped[datetime.date] = mapped_column(Date, nullable=False, default=datetime.date.today)
    
    distancia: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tiempo: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unidad_medida: Mapped[Optional[str]] = mapped_column(String, nullable=True) # METROS, SEGUNDOS, ETC.
    
    evaluacion: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # 1-10
    observaciones: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # Timestamps
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow
    )
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow
    )

    # Relaciones
    entrenamiento: Mapped["Entrenamiento"] = relationship("Entrenamiento")
    atleta: Mapped["Atleta"] = relationship("Atleta")
