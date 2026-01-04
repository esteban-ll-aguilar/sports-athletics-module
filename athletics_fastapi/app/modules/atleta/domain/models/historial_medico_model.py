from uuid import uuid4
from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.db.database import Base


class HistorialMedico(Base):
    __tablename__ = "historial_medico"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(UUID(as_uuid=True), default=uuid4, unique=True, index=True)

    talla = Column(Float, nullable=False)
    peso = Column(Float, nullable=False)
    imc = Column(Float, nullable=False)

    alergias = Column(String, nullable=True)
    enfermedades_hereditarias = Column(String, nullable=True)
    enfermedades = Column(String, nullable=True)

    # 🔥 AQUÍ ESTABA EL ERROR
    auth_user_id = Column(
        Integer,
        ForeignKey("auth_users.id", ondelete="CASCADE"),  # ✅ nombre correcto
        unique=True,
        nullable=False
    )

    user = relationship(
        "AuthUserModel",
        back_populates="historial_medico",
        uselist=False
    )
