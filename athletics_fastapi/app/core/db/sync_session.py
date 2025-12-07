from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config.enviroment import _SETTINGS

# Importante: usa la URL sincronica
DATABASE_URL = _SETTINGS.database_url_sync

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
