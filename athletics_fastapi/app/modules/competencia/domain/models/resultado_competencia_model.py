"""Modelo de Resultado de Competencia."""
from sqlalchemy import Integer, String, Date, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum as PyEnum

if TYPE_CHECKING:
    from app.modules.competencia.domain.models.competencia_model import Competencia
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.atleta.domain.models.atleta_model import Atleta
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel


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
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    
    # FKs
    competencia_id: Mapped[int] = mapped_column(Integer, ForeignKey("competencia.id"), nullable=False)
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"), nullable=False)
    prueba_id: Mapped[int] = mapped_column(Integer, ForeignKey("prueba.id"), nullable=False)
    entrenador_id: Mapped[int] = mapped_column(Integer, ForeignKey("auth_users.id"), nullable=False)
    
    # Datos de resultado
    resultado: Mapped[float] = mapped_column(Float, nullable=False)
    unidad_medida: Mapped[str] = mapped_column(String(50), default="m", nullable=False)  # metros, segundos, etc.
    posicion_final: Mapped[TipoPosicion] = mapped_column(String(50), default=TipoPosicion.PARTICIPANTE.value, nullable=False)
    puesto_obtenido: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1, 2, 3, etc.
    observaciones: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    fecha_registro: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow)
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    competencia: Mapped["Competencia"] = relationship("Competencia", back_populates="resultados")
    atleta: Mapped["Atleta"] = relationship("Atleta")
    prueba: Mapped["Prueba"] = relationship("Prueba")
    entrenador: Mapped["AuthUserModel"] = relationship("AuthUserModel")
