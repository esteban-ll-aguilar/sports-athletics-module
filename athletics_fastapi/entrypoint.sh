#!/bin/sh
set -e

# Esperar a la base de datos
echo "Checking database connection..."
python check_db.py

# Ejecutar migraciones
echo "Running database migrations..."
alembic upgrade head

# Iniciar la aplicación
echo "Starting application..."
exec "$@"
