
"""Modelo de datos para el historial médico de un atleta.
    Se define la estructura de la tabla historial_medico en la base de datos
    y sus relaciones con otros modelos.

"""

from sqlalchemy import Integer, String, Boolean, Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.atleta.domain.enums.enum import TipoEstamento
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import Optional
# Modelo de la base de datos para el historial médico de un atleta
class HistorialMedico(Base):
    __tablename__ = "historial_medico"
    # Definición de columnas de la tabla historial_medico
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    talla: Mapped[float] = mapped_column(Float)
    peso: Mapped[float] = mapped_column(Float)
    imc: Mapped[float] = mapped_column(Float)
    alergias: Mapped[str] = mapped_column(String, nullable=True)
    enfermedades_hereditarias: Mapped[str] = mapped_column(String, nullable=True)
    enfermedades: Mapped[str] = mapped_column(String, nullable=True)

    # Foreign Key to Atleta
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"), unique=True)
    
    atleta: Mapped["Atleta"] = relationship("Atleta", back_populates="historial_medico")
