"""Modelo de datos para el atleta.
    Se define la estructura de la tabla atleta en la base de datos
    y sus relaciones con otros modelos.
    Se importa el enum TipoEstamento para definir el tipo de estamento del atleta.
    Además, se utiliza UUID para el identificador externo del atleta.

"""
from sqlalchemy import Integer, String, Boolean, Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
import uuid
from typing import Optional
#class modelo de la base de datos para la entidad Atleta
class Atleta(Base):
    __tablename__ = "atleta"
    #metadatos de la tabla atleta
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    anios_experiencia: Mapped[int] = mapped_column(Integer)

    # Relationship to AuthUser
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("auth_users.id"), nullable=False)
    user: Mapped["AuthUserModel"] = relationship("AuthUserModel")

    # Relationship 1-to-1: Atleta has one HistorialMedico
    historial_medico: Mapped["HistorialMedico"] = relationship(
        "HistorialMedico", 
        back_populates="atleta", 
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Relationship N-to-1: Atleta has one Representante
    representante_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("representante.id"), nullable=True)
    representante: Mapped["Representante"] = relationship("Representante", back_populates="atletas")
