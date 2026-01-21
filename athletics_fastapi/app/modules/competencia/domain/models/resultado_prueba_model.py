"""Modelo de Resultado de Prueba (Test). Separado de Competencia."""
from sqlalchemy import Integer, String, Date, Float, Boolean, ForeignKey, DateTime, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum as PyEnum


if TYPE_CHECKING:
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.atleta.domain.models.atleta_model import Atleta
    from app.modules.competencia.domain.models.baremo_model import Baremo
    from app.modules.auth.domain.models.user_model import UserModel


class TipoPosicionPrueba(str, PyEnum):
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
    ENTRENAMIENTO = "entrenamiento" 


class ResultadoPrueba(Base):
    __tablename__ = "resultados_pruebas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    
    # Foreign Keys (Strict Diagram)
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"), nullable=False)
    prueba_id: Mapped[int] = mapped_column(Integer, ForeignKey("prueba.id"), nullable=False)
    baremo_id: Mapped[int] = mapped_column(Integer, ForeignKey("baremo.id"), nullable=False)
    # entrenador_id removed as per diagram strictness
    
    # Datos de resultado
    marca_obtenida: Mapped[float] = mapped_column(Float, nullable=False)
    
    clasificacion_final: Mapped[str] = mapped_column(String, nullable=True) # E.g. AVANZADO
    
    # fecha (timestamp)
    fecha: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow)
    
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Timestamps
    # Timestamps
    fecha: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow) # Diagram: fecha (timestamp)
    fecha_creacion: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.datetime.utcnow
    )
    fecha_actualizacion: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, onupdate=datetime.datetime.utcnow
    )
    
    # Relationships
    atleta: Mapped["Atleta"] = relationship("Atleta")
    prueba: Mapped["Prueba"] = relationship("Prueba")
    baremo: Mapped["Baremo"] = relationship("Baremo")
