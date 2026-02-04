from sqlalchemy import Integer, String, Boolean, ForeignKey, text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.competencia.domain.enums.enum import Sexo
import uuid
from typing import List, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo

# Modelo de datos para la entidad Baremo (Contexto de evaluación)
class Baremo(Base):
    """
    Representa la tabla de baremación (escalas de evaluación) para una prueba específica.
    
    Esta entidad define los criterios de evaluación segmentados por sexo y rangos de edad,
    permitiendo asociar puntajes específicos a los resultados obtenidos por los atletas.
    """
    __tablename__ = "baremo"
    # Identificadores
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False, default="Baremo General", server_default="Baremo General")
    
    # Llaves Foráneas y Filtros de Negocio
    prueba_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("prueba.id"), nullable=True)
    sexo: Mapped[Sexo] = mapped_column(String, nullable=False)
    edad_min: Mapped[int] = mapped_column(Integer, nullable=False)
    edad_max: Mapped[int] = mapped_column(Integer, nullable=False)
    marca_min_valida: Mapped[float] = mapped_column(Float, nullable=True, default=0.0)
    marca_max_valida: Mapped[float] = mapped_column(Float, nullable=True, default=0.0)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relalaciones 
    prueba: Mapped["Prueba"] = relationship("Prueba", back_populates="baremos")
    items: Mapped[List["ItemBaremo"]] = relationship("ItemBaremo", back_populates="baremo", cascade="all, delete-orphan")
