from sqlalchemy import Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db.database import Base
from app.modules.atleta.domain.enums.enum import TipoEstamento
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
import uuid
from typing import List

class Representante(Base):
    __tablename__ = "representante"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    estamento: Mapped[TipoEstamento] = mapped_column(String)

    # Relationship to AuthUser
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("auth_users.id"), nullable=False)
    user: Mapped["AuthUserModel"] = relationship("AuthUserModel")

    # Relationships
    atletas: Mapped[List["Atleta"]] = relationship("Atleta", back_populates="representante")
