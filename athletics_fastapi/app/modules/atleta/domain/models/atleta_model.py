"""Modelo de datos para el atleta.
    Se define la estructura de la tabla atleta en la base de datos
    y sus relaciones con otros modelos.
    Además, se utiliza UUID para el identificador externo del atleta.

"""
from datetime import date
from sqlalchemy import Date, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
import uuid
from uuid import UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico

class Atleta(Base):
    __tablename__ = "atleta"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, autoincrement=True
    )

    external_id: Mapped[UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True
    )

    anios_experiencia: Mapped[int] = mapped_column(Integer, nullable=False)
    
    fecha_nacimiento: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    # 🔗 Relación con usuario
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("auth_users.id"),
        nullable=False
    )

    user: Mapped["AuthUserModel"] = relationship("AuthUserModel")

    # 🔗 Relación 1–1 con historial médico
    historial_medico: Mapped["HistorialMedico"] = relationship(
        "HistorialMedico",
        back_populates="atleta",
        uselist=False,
        cascade="all, delete-orphan"
    )

    #revisar relacion con representante
    # Relationship N-to-1: Atleta has one Representante
   # representante_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("representante.id"), nullable=True)
   # representante: Mapped["Representante"] = relationship("Representante", back_populates="atletas")
