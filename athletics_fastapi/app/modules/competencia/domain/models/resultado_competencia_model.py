"""Modelo de Resultado de Competencia corregido para usar auth_users como atleta."""
from sqlalchemy import Integer, String, Date, Float, Boolean, ForeignKey, DateTime, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum as PyEnum


if TYPE_CHECKING:
    from app.modules.competencia.domain.models.competencia_model import Competencia
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.auth.domain.models.user_model import UserModel


class TipoPosicion(str, PyEnum):
    PRIMERO = "primero"
    SEGUNDO = "segundo"
    TERCERO = "tercero"
    CUARTO = "cuarto"
    QUINTO = "quinto"
    SEXTO = "sexto"
    SEPTIMO = "septimo"
    OCTAVO = "octavo"
    PARTICIPANTE = "participante"
    DESCALIFICADO = "descalificado"


class ResultadoCompetencia(Base):
    __tablename__ = "resultado_competencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    
    # FKs
    competencia_id: Mapped[int] = mapped_column(Integer, ForeignKey("competencia.id"), nullable=False)
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)  # <-- CORREGIDO
    prueba_id: Mapped[int] = mapped_column(Integer, ForeignKey("prueba.id"), nullable=False)
    entrenador_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Datos de resultado
    resultado: Mapped[float] = mapped_column(Float, nullable=False)
    unidad_medida: Mapped[str] = mapped_column(String(50), default="m", nullable=False)
    posicion_final: Mapped[TipoPosicion] = mapped_column(
        String(50), default=TipoPosicion.PARTICIPANTE.value, nullable=False
    )
    puesto_obtenido: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    fecha_registro: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow
    )
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow
    )
    
    # Relationships
    competencia: Mapped["Competencia"] = relationship("Competencia", back_populates="resultados")
    atleta: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[atleta_id])
    prueba: Mapped["Prueba"] = relationship("Prueba")
    entrenador: Mapped["UserModel"] = relationship("UserModel", foreign_keys=[entrenador_id])
