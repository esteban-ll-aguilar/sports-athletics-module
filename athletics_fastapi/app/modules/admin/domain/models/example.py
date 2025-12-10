from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, DateTime, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from app.core.db.database import Base
import uuid, datetime
from typing import TYPE_CHECKING

# Modelo de la base de datos para la entidad Example
class ExampleModel(Base):
    __tablename__ = "examples"
    # Definición de columnas 
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(75), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())
