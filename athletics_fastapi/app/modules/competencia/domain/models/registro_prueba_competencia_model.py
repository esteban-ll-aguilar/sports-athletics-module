from sqlalchemy import Integer, Float, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class RegistroPruebaCompetencia(Base):
    __tablename__ = "registro_prueba_competencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True, default=uuid.uuid4, onupdate=uuid.uuid4)
    id_entrenador: Mapped[int] = mapped_column(Integer)
    valor: Mapped[float] = mapped_column(Float)
    fecha_registro: Mapped[Date] = mapped_column(Date)

    # FKs
    prueba_id: Mapped[int] = mapped_column(Integer, ForeignKey("prueba.id"))
    atleta_id: Mapped[int] = mapped_column(Integer, ForeignKey("atleta.id"))

    # Relationships
    prueba: Mapped["Prueba"] = relationship("Prueba")
    atleta: Mapped["Atleta"] = relationship("Atleta")
