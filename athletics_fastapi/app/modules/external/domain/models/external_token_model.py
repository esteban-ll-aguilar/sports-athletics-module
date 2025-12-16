from app.core.db.database import Base
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from app.modules.external.domain.enums import ExternalClassTokenType


class ExternalTokenModel(Base):
    __tablename__ = "external_tokens"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token = Column(String, nullable=False)
    external_id = Column(String, nullable=False)
    token_type = Column(Enum(ExternalClassTokenType), nullable=False, unique=True)
    updated_at = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, nullable=False, default=func.now())
    








    
    





