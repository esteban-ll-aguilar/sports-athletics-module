from sqlalchemy import Integer, String, Float, Boolean, ForeignKey, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid

class ItemBaremo(Base):
    """
    Representa un rango específico de rendimiento dentro de un Baremo.
    
    Esta entidad define los umbrales (marcas) que un atleta debe alcanzar para obtener
    una clasificación determinada (ej. 'Excelente', 'Promedio', o puntajes numéricos).
    """
    __tablename__ = "item_baremo"
    # Identificadores
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")
    )
    
    # Llaves foraneas
    baremo_id: Mapped[int] = mapped_column(Integer, ForeignKey("baremo.id"), nullable=False)
    
    clasificacion: Mapped[str] = mapped_column(String, nullable=False)
    marca_minima: Mapped[float] = mapped_column(Float, nullable=False)
    marca_maxima: Mapped[float] = mapped_column(Float, nullable=False)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    baremo: Mapped["Baremo"] = relationship("Baremo", back_populates="items")
