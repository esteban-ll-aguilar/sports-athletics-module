from __future__ import annotations
import asyncio
import os
import sys
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Añadir directorio raíz al path para que los imports funcionen
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Importa la configuración y los modelos necesarios para las migraciones

from app.core.config.enviroment import _SETTINGS
from app.core.db.database import Base
from app.modules.entrenador.domain.models.resultado_entrenamiento_model import ResultadoEntrenamiento # Explicit Import
from app.modules.auth.domain.models.auth_user_model import AuthUserModel # Import this to register 'users' table
from app.modules.atleta.domain.models.atleta_model import Atleta # Import this to register 'atleta' table
from app.modules.representante.domain.models.representante_model import Representante # Import this to register 'representante' table
from app.modules.competencia.domain.models.baremo_model import Baremo 
from app.modules.competencia.domain.models.item_baremo_model import ItemBaremo
from app.modules.competencia.domain.models.resultado_prueba_model import ResultadoPrueba
from app.modules.competencia.domain.models.registro_prueba_competencia_model import RegistroPruebaCompetencia
from app.modules.competencia.domain.models.prueba_model import Prueba


# Este es el objeto de configuración de Alembic 
# que proporciona acceso a los valores del archivo .ini en uso.
config = context.config

# Interpreta el archivo de configuración para el logging de Python.
# Esta línea configura los loggers.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Agrega el objeto MetaData de tus modelos aquí para el soporte de 'autogenerate'
# Esto permite que Alembic detecte los cambios en los modelos automáticamente.

target_metadata = Base.metadata
target_metadata = Base.metadata


def get_url() -> str:
    """
    Obtiene la URL de la base de datos asíncrona desde la configuración.
    """
    return _SETTINGS.database_url_async


def run_migrations_offline() -> None:
    """
    Ejecuta las migraciones en modo 'offline'.

    En este modo, se configura el contexto solo con la URL de la base de datos,
    sin necesidad de crear un Engine ni requerir un DBAPI disponible.
    Las llamadas a context.execute() emitirán el SQL generado como texto.
    """

    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """
    Configura y ejecuta las migraciones utilizando una conexión proporcionada.
    Args:
        connection (Connection): Conexión a la base de datos.
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """
    Ejecuta las migraciones en modo 'online'.

    En este escenario, se crea un Engine asíncrono y se asocia una conexión
    con el contexto de Alembic para aplicar las migraciones directamente a la base de datos.
    """
    connectable = create_async_engine(get_url(), poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

# Determina si Alembic debe correr en modo offline u online y ejecuta la función correspondiente.

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())