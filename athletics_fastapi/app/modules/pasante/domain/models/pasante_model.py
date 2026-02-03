from sqlalchemy import Integer, String, Boolean, Date, ForeignKey, Enum, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.db.database import Base
import uuid
import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.auth.domain.models.user_model import UserModel

class Pasante(Base):
    __tablename__ = "pasante"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    external_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        default=uuid.uuid4,
        unique=True,
        index=True,
        server_default=text("gen_random_uuid()")
    )

    # 🔗 User (1–1)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    user: Mapped["UserModel"] = relationship(
        "UserModel",
        backref="pasante",
        uselist=False
    )

    # -------- Datos específicos de Pasante --------
    fecha_inicio: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    
    especialidad: Mapped[str] = mapped_column(String, nullable=False)
    institucion_origen: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Estado: True = Activo, False = Inactivo
    estado: Mapped[bool] = mapped_column(Boolean, default=True)

    @property
    def first_name(self) -> Optional[str]:
        return self.user.first_name if self.user else None

    @property
    def last_name(self) -> Optional[str]:
        return self.user.last_name if self.user else None

    @property
    def email(self) -> Optional[str]:
        return self.user.email if self.user else None

    @property
    def identificacion(self) -> str:
        # Pydantic schema expects a string, so we return empty if no user
        return self.user.identificacion if self.user else ""

    @property
    def phone(self) -> Optional[str]:
        return self.user.phone if self.user else None
