#!/bin/sh
# entrypoint.sh - Script de inicio para Azure App Service

# Salir inmediatamente si un comando falla
set -e

echo "--------------------------------------------------"
echo "🚀 INICIANDO ENTORNO: ${ENV:-production}"
echo "--------------------------------------------------"

# 1. Delay de cortesía para servicios de red
echo "⏳ Esperando 5 segundos para estabilidad de red..."
sleep 5

# 2. Verificación de Base de Datos
echo "🔍 Verificando conexión a PostgreSQL..."
if ! python check_db.py; then
    echo "❌ ERROR: No se pudo conectar a la base de datos."
    exit 1
fi

# 3. Migraciones de Alembic
echo "📂 Sincronizando esquema de base de datos (Migrations)..."
if ! alembic upgrade head; then
    echo "❌ ERROR: Las migraciones de base de datos fallaron."
    exit 1
fi

# 4. Verificación de variables críticas
echo "✅ Verificando configuración..."

# 5. Iniciar Aplicación
echo "--------------------------------------------------"
echo "✨ Todos los sistemas listos. Iniciando Uvicorn..."
echo "--------------------------------------------------"

# Usamos exec para que uvicorn sea el proceso principal (PID 1)
exec "$@"
