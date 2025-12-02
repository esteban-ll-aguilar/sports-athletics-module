from sqlalchemy import Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
import uuid
from typing import List

class Entrenador(Base):
    __tablename__ = "entrenador"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    is_pasante: Mapped[bool] = mapped_column(Boolean, default=False)
    anios_experiencia: Mapped[int] = mapped_column(Integer)

    # Relationship to AuthUser
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("auth_users.id"), nullable=False)
    user: Mapped["AuthUserModel"] = relationship("AuthUserModel")

    # Relationships
    entrenamientos: Mapped[List["Entrenamiento"]] = relationship("Entrenamiento", back_populates="entrenador")
