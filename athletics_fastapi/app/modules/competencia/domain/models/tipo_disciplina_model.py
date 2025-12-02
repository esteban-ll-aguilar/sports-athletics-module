from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class TipoDisciplina(Base):
    __tablename__ = "tipo_disciplina"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    nombre: Mapped[str] = mapped_column(String)
    descripcion: Mapped[str] = mapped_column(String)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
