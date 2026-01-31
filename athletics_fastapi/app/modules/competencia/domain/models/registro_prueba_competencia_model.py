from sqlalchemy import Integer, ForeignKey, text, Float, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
import uuid
from typing import TYPE_CHECKING


# 👇 SOLO para tipado (evita import circular)
if TYPE_CHECKING:
    from app.modules.competencia.domain.models.prueba_model import Prueba
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel


class RegistroPruebaCompetencia(Base):
    """
    Entidad que almacena los resultados individuales obtenidos por los atletas.
    
    Relaciona a un usuario (atleta) con una prueba específica y registra el valor 
    logrado (tiempo o distancia), permitiendo la trazabilidad de quién supervisó 
    la toma de la marca.
    """
    __tablename__ = "registro_prueba_competencia"
    
    # Identificadores 
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    external_id: Mapped[uuid.UUID] = mapped_column(
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()"),
        server_onupdate=text("gen_random_uuid()")

    )
    # Datos de Resultados 

    id_entrenador: Mapped[int] = mapped_column(Integer)
    valor: Mapped[float] = mapped_column(Float)
    fecha_registro: Mapped[Date] = mapped_column(Date)

    # Llaves Foraneas 
    prueba_id: Mapped[int] = mapped_column(
        ForeignKey("prueba.id"),
        nullable=False
    )

    auth_user_id: Mapped[int] = mapped_column(
        ForeignKey("auth_users.id"),
        nullable=False
    )

    # Relaciones 
    prueba: Mapped["Prueba"] = relationship("Prueba")

    auth_user: Mapped["AuthUserModel"] = relationship(
        "AuthUserModel"
    )
