from sqlalchemy import Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.competencia.domain.enums.enum import PruebaType
from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import Optional

class Prueba(Base):
    __tablename__ = "prueba"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    siglas: Mapped[str] = mapped_column(String)
    fecha_registro: Mapped[Date] = mapped_column(Date)
    tipo_prueba: Mapped[PruebaType] = mapped_column(String)
    unidad_medida: Mapped[str] = mapped_column(String)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # FKs
    tipo_disciplina_id: Mapped[int] = mapped_column(Integer, ForeignKey("tipo_disciplina.id"))
    baremo_id: Mapped[int] = mapped_column(Integer, ForeignKey("baremo.id"))

    # Relationships
    tipo_disciplina: Mapped["TipoDisciplina"] = relationship("TipoDisciplina")
    baremo: Mapped["Baremo"] = relationship("Baremo")
