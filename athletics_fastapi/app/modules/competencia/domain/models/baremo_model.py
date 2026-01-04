from sqlalchemy import Integer, Float, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db.database import Base
from app.modules.competencia.domain.enums.enum import TipoClasificacion
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Modelo de datos para la entidad Baremo
class Baremo(Base):
    __tablename__ = "baremo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    valor_baremo: Mapped[float] = mapped_column(Float)
    clasificacion: Mapped[TipoClasificacion] = mapped_column(String)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
