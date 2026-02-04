from sqlalchemy import Integer, String, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.db.database import Base
import uuid

# Modelo de datos para la entidad TipoDisciplina
class TipoDisciplina(Base):
    __tablename__ = "tipo_disciplina"
    #identificadores
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    # Informacion de la disciplina 
    nombre: Mapped[str] = mapped_column(String)
    descripcion: Mapped[str] = mapped_column(String)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
