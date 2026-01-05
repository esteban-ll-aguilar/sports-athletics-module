"""Modelo de datos para el atleta.
    Se define la estructura de la tabla atleta en la base de datos
    y sus relaciones con otros modelos.
    Además, se utiliza UUID para el identificador externo del atleta.

"""
from sqlalchemy import Integer, String, Boolean, Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
# Import Representante to ensure visibility for SQLAlchemy relationship
from app.modules.representante.domain.models.representante_model import Representante 
import uuid
from typing import Optional, TYPE_CHECKING, List


if TYPE_CHECKING:
    from app.modules.representante.domain.models.representante_model import Representante
    from app.modules.atleta.domain.models.historial_medico_model import HistorialMedico
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
    #revisar relacion con representante
    # Relationship N-to-1: Atleta has one Representante
    representante_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("representante.id"), nullable=True)
    representante: Mapped["Representante"] = relationship("Representante", back_populates="atletas")

    registros_asistencias: Mapped[List["RegistroAsistencias"]] = relationship(
        "RegistroAsistencias", 
        back_populates="atleta",
        cascade="all, delete-orphan" 
    )
