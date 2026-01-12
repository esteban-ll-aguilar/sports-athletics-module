from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Date, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
from typing import Optional, TYPE_CHECKING
import uuid, datetime

from app.modules.auth.domain.enums import (
    TipoEstamentoEnum,
    TipoIdentificacionEnum,
    RoleEnum,
    SexoEnum
)

if TYPE_CHECKING:
    from app.modules.atleta.domain.models.atleta_model import Atleta
    from app.modules.entrenador.domain.models.entrenador_model import Entrenador
    from app.modules.representante.domain.models.representante_model import Representante
    from app.modules.auth.domain.models.auth_user_model import AuthUserModel


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    auth_user_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        unique=True,
        index=True
    )

    external_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True
    )

    # -------- Datos personales --------
    username: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(17), nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    direccion: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    tipo_identificacion: Mapped[TipoIdentificacionEnum] = mapped_column(
        Enum(TipoIdentificacionEnum),
        nullable=False
    )

    identificacion: Mapped[str] = mapped_column(
        String, nullable=False, unique=True, index=True
    )

    tipo_estamento: Mapped[TipoEstamentoEnum] = mapped_column(
        Enum(TipoEstamentoEnum),
        nullable=False
    )

    fecha_nacimiento: Mapped[Optional[datetime.date]] = mapped_column(Date)

    sexo: Mapped[Optional[SexoEnum]] = mapped_column(Enum(SexoEnum))

    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum),
        default=RoleEnum.ATLETA,
        nullable=False
    )

    # -------- Relaciones --------
    auth = relationship(
        "AuthUserModel",
        back_populates="profile"
    )

    atleta: Mapped[Optional["Atleta"]] = relationship(
        "Atleta",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    entrenador: Mapped[Optional["Entrenador"]] = relationship(
        "Entrenador",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    representante: Mapped[Optional["Representante"]] = relationship(
        "Representante",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
