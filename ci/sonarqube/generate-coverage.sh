#!/bin/bash

# ============================================
# Script de Generación de Cobertura
# ============================================

set -e

echo "============================================"
echo "📊 Generando Reportes de Cobertura"
echo "============================================"
echo ""

# ============================================
# Backend - Python Coverage
# ============================================
echo "🐍 Generando cobertura del Backend (Python)..."
echo "--------------------------------------------"

cd athletics_fastapi

# Verificar si existe el entorno virtual
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "⚠️  No se encontró entorno virtual. Creando uno nuevo..."
    python -m venv venv
    source venv/bin/activate || . venv/Scripts/activate
    pip install -r requirements.txt
else
    # Activar entorno virtual
    if [ -d "venv" ]; then
        source venv/bin/activate || . venv/Scripts/activate
    else
        source .venv/bin/activate || . .venv/Scripts/activate
    fi
fi

# Instalar/actualizar pytest-cov si es necesario
pip install pytest-cov --quiet

# Ejecutar tests con cobertura
echo "🧪 Ejecutando tests con cobertura..."
pytest -c tests/pytest.ini || echo "⚠️  Algunos tests fallaron, pero continuamos con el reporte de cobertura"

# Verificar que se generó el archivo de cobertura
if [ -f "coverage.xml" ]; then
    echo "✅ Reporte de cobertura XML generado: coverage.xml"
else
    echo "⚠️  No se generó coverage.xml"
fi

if [ -d "htmlcov" ]; then
    echo "✅ Reporte HTML generado en: htmlcov/"
else
    echo "⚠️  No se generó el reporte HTML"
fi

cd ..
echo ""

# ============================================
# Frontend - JavaScript/TypeScript Coverage
# ============================================
echo "⚛️  Generando cobertura del Frontend (JS/TS)..."
echo "--------------------------------------------"

cd athletics_vite_ui

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de npm..."
    npm install
fi

# Instalar @vitest/coverage-v8 si no está instalado
if ! npm list @vitest/coverage-v8 > /dev/null 2>&1; then
    echo "📦 Instalando @vitest/coverage-v8..."
    npm install --save-dev @vitest/coverage-v8
fi

# Ejecutar tests con cobertura
echo "🧪 Ejecutando tests con cobertura..."
npm run test -- --coverage || echo "⚠️  Algunos tests fallaron, pero continuamos con el reporte de cobertura"

# Verificar que se generó el archivo de cobertura
if [ -f "coverage/lcov.info" ]; then
    echo "✅ Reporte de cobertura LCOV generado: coverage/lcov.info"
else
    echo "⚠️  No se generó coverage/lcov.info"
fi

if [ -d "coverage" ]; then
    echo "✅ Reportes de cobertura generados en: coverage/"
else
    echo "⚠️  No se generó el directorio de cobertura"
fi

cd ..
echo ""

# ============================================
# Resumen
# ============================================
echo "============================================"
echo "✅ Generación de Cobertura Completada"
echo "============================================"
echo ""
echo "📁 Archivos generados:"
echo "  Backend:  athletics_fastapi/coverage.xml"
echo "  Frontend: athletics_vite_ui/coverage/lcov.info"
echo ""
echo "🔍 Ahora puedes ejecutar el análisis de SonarQube"
echo "============================================"
