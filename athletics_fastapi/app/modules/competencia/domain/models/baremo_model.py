from sqlalchemy import Integer, String, Boolean, Float, ForeignKey, UUID as PG_UUID, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.competencia.domain.enums.enum import Sexo
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo

# Modelo de datos para la entidad Baremo (Contexto de evaluación)
class Baremo(Base):
    __tablename__ = "baremo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    
    prueba_id: Mapped[int] = mapped_column(Integer, ForeignKey("prueba.id"), nullable=False)
    sexo: Mapped[Sexo] = mapped_column(String, nullable=False)
    edad_min: Mapped[int] = mapped_column(Integer, nullable=False)
    edad_max: Mapped[int] = mapped_column(Integer, nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    prueba: Mapped["Prueba"] = relationship("Prueba", back_populates="baremos")
    items: Mapped[List["ItemBaremo"]] = relationship("ItemBaremo", back_populates="baremo", cascade="all, delete-orphan")
