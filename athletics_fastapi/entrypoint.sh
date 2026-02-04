#!/bin/sh
set -e

# Pequeño delay para dar tiempo a PgBouncer
echo "Waiting for services to be ready..."
sleep 5

# Esperar a la base de datos
echo "Checking database connection..."
python check_db.py

# Ejecutar migraciones
echo "Running database migrations..."
alembic upgrade head

# Iniciar la aplicación
echo "Starting application..."
exec "$@"
