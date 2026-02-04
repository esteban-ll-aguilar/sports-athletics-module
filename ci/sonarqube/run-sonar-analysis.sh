#!/bin/bash

# ============================================
# Script de Análisis de SonarQube
# ============================================

set -e

echo "============================================"
echo "🔍 Iniciando análisis de SonarQube"
echo "============================================"

# Esperar a que SonarQube esté disponible
echo "⏳ Esperando a que SonarQube esté disponible..."
until curl -s "${SONAR_HOST_URL}/api/system/status" | grep -q '"status":"UP"'; do
    echo "   SonarQube aún no está listo, esperando..."
    sleep 5
done

echo "✅ SonarQube está listo"
echo ""

# Mostrar información del proyecto
echo "============================================"
echo "📊 Información del Proyecto"
echo "============================================"
echo "Host: ${SONAR_HOST_URL}"
echo "Archivo de configuración: ci/sonar-project.properties"
echo ""

# Ejecutar análisis de SonarQube
echo "============================================"
echo "🚀 Ejecutando análisis de código..."
echo "============================================"

sonar-scanner \
    -Dsonar.host.url="${SONAR_HOST_URL}" \
    -Dsonar.login="${SONAR_LOGIN:-admin}" \
    -Dsonar.password="${SONAR_PASSWORD:-admin}" \
    -Dproject.settings=ci/sonar-project.properties \
    -X

echo ""
echo "============================================"
echo "✅ Análisis completado exitosamente"
echo "============================================"
echo "📊 Revisa los resultados en: ${SONAR_HOST_URL}"
echo "============================================"
