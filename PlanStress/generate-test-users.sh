#!/bin/bash

###############################################################################
# Script: generate-test-users.sh
# Descripción: Genera archivo CSV con usuarios de prueba para JMeter/Gatling
# Uso: bash generate-test-users.sh [cantidad_usuarios]
###############################################################################

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
OUTPUT_FILE="users.csv"
DEFAULT_USERS=100

# Obtener cantidad de usuarios del argumento o usar default
NUM_USERS=${1:-$DEFAULT_USERS}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Generador de Usuarios de Prueba      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Generando ${NUM_USERS} usuarios...${NC}"
echo ""

# Crear encabezado del CSV
echo "email,password" > $OUTPUT_FILE

# Generar usuarios normales
for i in $(seq 1 $NUM_USERS); do
    echo "user${i}@test.com,Password123!" >> $OUTPUT_FILE
done

# Añadir usuarios específicos por rol
echo "admin@test.com,Admin123!" >> $OUTPUT_FILE
echo "entrenador1@test.com,Entrenador123!" >> $OUTPUT_FILE
echo "entrenador2@test.com,Entrenador123!" >> $OUTPUT_FILE
echo "atleta1@test.com,Atleta123!" >> $OUTPUT_FILE
echo "atleta2@test.com,Atleta123!" >> $OUTPUT_FILE
echo "atleta3@test.com,Atleta123!" >> $OUTPUT_FILE
echo "representante1@test.com,Representante123!" >> $OUTPUT_FILE
echo "representante2@test.com,Representante123!" >> $OUTPUT_FILE

# Calcular total
TOTAL=$((NUM_USERS + 8))

echo -e "${GREEN}✅ Archivo creado: ${OUTPUT_FILE}${NC}"
echo -e "${GREEN}✅ Total de usuarios: ${TOTAL}${NC}"
echo ""
echo -e "${BLUE}📋 Usuarios especiales incluidos:${NC}"
echo "   • admin@test.com"
echo "   • entrenador1@test.com, entrenador2@test.com"
echo "   • atleta1@test.com, atleta2@test.com, atleta3@test.com"
echo "   • representante1@test.com, representante2@test.com"
echo ""
echo -e "${YELLOW}⚠️  Recuerda: Estos usuarios deben existir en tu base de datos${NC}"
echo -e "${YELLOW}    o debes registrarlos antes de ejecutar las pruebas.${NC}"
echo ""

# Mostrar primeras 10 líneas
echo -e "${BLUE}📄 Primeras 10 líneas del archivo:${NC}"
head -n 10 $OUTPUT_FILE

echo ""
echo -e "${GREEN}✨ Listo para usar con JMeter o Gatling${NC}"
