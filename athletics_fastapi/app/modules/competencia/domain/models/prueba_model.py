from sqlalchemy import Integer, String, Date, Boolean, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.competencia.domain.enums.enum import PruebaType, TipoMedicion
import uuid
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.competencia.domain.models.tipo_disciplina_model import TipoDisciplina
    from app.modules.competencia.domain.models.baremo_model import Baremo

# Modelo de datos para la entidad Prueba
class Prueba(Base):
    __tablename__ = "prueba"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    siglas: Mapped[str] = mapped_column(String, nullable=True) # Making nullable if name is primary, or keep as is
    fecha_registro: Mapped[Date] = mapped_column(Date)
    fecha_prueba: Mapped[Date] = mapped_column(Date, nullable=True) # Added from ER
    tipo_prueba: Mapped[PruebaType] = mapped_column(String, nullable=True)
    tipo_medicion: Mapped[TipoMedicion] = mapped_column(String, nullable=False) # TIEMPO / DISTANCIA
    unidad_medida: Mapped[str] = mapped_column(String)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # FKs
    tipo_disciplina_id: Mapped[int] = mapped_column(Integer, ForeignKey("tipo_disciplina.id"))
    # baremo_id removed (inverse relationship)

    # Relationships
    tipo_disciplina: Mapped["TipoDisciplina"] = relationship("TipoDisciplina")
    baremos: Mapped[List["Baremo"]] = relationship("Baremo", back_populates="prueba")
    
