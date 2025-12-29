from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config.enviroment import _SETTINGS

# Importante: usa la URL sincronica
DATABASE_URL = _SETTINGS.database_url_sync
# Crear el engine de la base de datos
engine = create_engine(DATABASE_URL)

#session local para las operaciones de la base de datos
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
