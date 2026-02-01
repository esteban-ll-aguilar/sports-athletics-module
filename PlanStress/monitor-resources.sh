#!/bin/bash

###############################################################################
# Script: monitor-resources.sh
# Descripción: Monitorea recursos del sistema en tiempo real durante pruebas
# Uso: bash monitor-resources.sh
###############################################################################

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
REFRESH_INTERVAL=3
LOG_FILE="monitoring-$(date +%Y%m%d_%H%M%S).log"

# Función para dibujar línea separadora
draw_line() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
}

# Función para obtener timestamp
get_timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
        exit 1
    fi
}

# Función para obtener uso de CPU de un contenedor
get_container_cpu() {
    local container=$1
    docker stats --no-stream --format "{{.CPUPerc}}" $container 2>/dev/null | sed 's/%//'
}

# Función para obtener uso de memoria de un contenedor
get_container_memory() {
    local container=$1
    docker stats --no-stream --format "{{.MemUsage}}" $container 2>/dev/null
}

# Función para colorear valores según umbrales
color_value() {
    local value=$1
    local threshold_warning=$2
    local threshold_critical=$3
    
    if (( $(echo "$value >= $threshold_critical" | bc -l) )); then
        echo -e "${RED}${value}%${NC}"
    elif (( $(echo "$value >= $threshold_warning" | bc -l) )); then
        echo -e "${YELLOW}${value}%${NC}"
    else
        echo -e "${GREEN}${value}%${NC}"
    fi
}

# Función principal de monitoreo
monitor() {
    check_docker
    
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║          MONITOR DE RECURSOS - PRUEBAS DE DESEMPEÑO         ║"
    echo "║                 Presiona Ctrl+C para detener                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}📝 Los datos se están guardando en: ${LOG_FILE}${NC}"
    echo ""
    
    # Escribir header en el log
    echo "Timestamp,Backend_CPU,Backend_Memory,DB_CPU,DB_Memory,Prometheus_CPU,Grafana_CPU,DB_Connections,Slow_Queries" > $LOG_FILE
    
    while true; do
        clear
        
        # Header
        echo -e "${CYAN}"
        echo "╔══════════════════════════════════════════════════════════════╗"
        echo "║          MONITOR DE RECURSOS - PRUEBAS DE DESEMPEÑO         ║"
        echo "╚══════════════════════════════════════════════════════════════╝"
        echo -e "${NC}"
        echo -e "${MAGENTA}🕐 $(get_timestamp)${NC}"
        echo ""
        
        draw_line
        echo -e "${CYAN}📦 CONTENEDORES DOCKER${NC}"
        draw_line
        
        # Stats de contenedores
        echo ""
        printf "%-25s %-15s %-20s %-15s\n" "CONTENEDOR" "CPU" "MEMORIA" "NETWORK I/O"
        echo "─────────────────────────────────────────────────────────────────────────────"
        
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | tail -n +2 | while read line; do
            echo "$line"
        done
        
        echo ""
        draw_line
        echo -e "${CYAN}💾 BASE DE DATOS - MARIADB${NC}"
        draw_line
        echo ""
        
        # Conexiones MySQL
        DB_CONNECTIONS=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Threads_connected';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        DB_MAX_CONNECTIONS=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW VARIABLES LIKE 'max_connections';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        
        if [ ! -z "$DB_CONNECTIONS" ] && [ ! -z "$DB_MAX_CONNECTIONS" ]; then
            CONN_PERCENT=$(echo "scale=2; $DB_CONNECTIONS * 100 / $DB_MAX_CONNECTIONS" | bc)
            echo -e "  Conexiones Activas:    ${DB_CONNECTIONS} / ${DB_MAX_CONNECTIONS} $(color_value $CONN_PERCENT 70 90)"
        else
            echo -e "  Conexiones Activas:    ${RED}No disponible${NC}"
        fi
        
        # Queries lentas
        SLOW_QUERIES=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Slow_queries';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        if [ ! -z "$SLOW_QUERIES" ]; then
            echo -e "  Queries Lentas (total): $SLOW_QUERIES"
        fi
        
        # Queries por segundo
        QUERIES=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Queries';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        UPTIME=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Uptime';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        if [ ! -z "$QUERIES" ] && [ ! -z "$UPTIME" ] && [ "$UPTIME" -gt 0 ]; then
            QPS=$(echo "scale=2; $QUERIES / $UPTIME" | bc)
            echo -e "  Queries por Segundo:    $QPS"
        fi
        
        # InnoDB Buffer Pool
        BUFFER_POOL_HIT=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Innodb_buffer_pool_read_requests';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        BUFFER_POOL_MISS=$(docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Innodb_buffer_pool_reads';" 2>/dev/null | tail -n 1 | awk '{print $2}')
        if [ ! -z "$BUFFER_POOL_HIT" ] && [ ! -z "$BUFFER_POOL_MISS" ] && [ "$BUFFER_POOL_HIT" -gt 0 ]; then
            TOTAL_READS=$((BUFFER_POOL_HIT + BUFFER_POOL_MISS))
            if [ $TOTAL_READS -gt 0 ]; then
                HIT_RATE=$(echo "scale=2; ($BUFFER_POOL_HIT * 100) / $TOTAL_READS" | bc)
                echo -e "  Buffer Pool Hit Rate:   ${HIT_RATE}%"
            fi
        fi
        
        echo ""
        draw_line
        echo -e "${CYAN}📊 MÉTRICAS DEL BACKEND${NC}"
        draw_line
        echo ""
        
        # Verificar si actuator está disponible
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            HEALTH_STATUS=$(curl -s http://localhost:8080/actuator/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            if [ "$HEALTH_STATUS" == "UP" ]; then
                echo -e "  Estado del Backend:     ${GREEN}✅ UP${NC}"
            else
                echo -e "  Estado del Backend:     ${RED}❌ DOWN${NC}"
            fi
            
            # Obtener número de requests (si está disponible en metrics)
            REQUESTS=$(curl -s http://localhost:8080/actuator/metrics/http.server.requests 2>/dev/null | grep -o '"count":[0-9]*' | head -1 | cut -d':' -f2)
            if [ ! -z "$REQUESTS" ]; then
                echo -e "  Total Requests:         $REQUESTS"
            fi
        else
            echo -e "  Estado del Backend:     ${YELLOW}⚠️  Actuator no disponible${NC}"
        fi
        
        echo ""
        draw_line
        echo -e "${CYAN}🔍 PROMETHEUS & GRAFANA${NC}"
        draw_line
        echo ""
        
        # Verificar Prometheus
        if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
            echo -e "  Prometheus:             ${GREEN}✅ Operacional${NC}"
        else
            echo -e "  Prometheus:             ${RED}❌ No disponible${NC}"
        fi
        
        # Verificar Grafana
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "  Grafana:                ${GREEN}✅ Operacional${NC}"
        else
            echo -e "  Grafana:                ${RED}❌ No disponible${NC}"
        fi
        
        echo ""
        draw_line
        echo -e "${CYAN}⚙️  SISTEMA HOST${NC}"
        draw_line
        echo ""
        
        # CPU del host
        if command -v mpstat &> /dev/null; then
            CPU_IDLE=$(mpstat 1 1 | tail -1 | awk '{print $NF}')
            CPU_USAGE=$(echo "100 - $CPU_IDLE" | bc)
            echo -e "  CPU Host:               $(color_value $CPU_USAGE 70 90)"
        fi
        
        # Memoria del host
        if command -v free &> /dev/null; then
            MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
            MEM_USED=$(free -m | awk 'NR==2{print $3}')
            MEM_PERCENT=$(echo "scale=2; ($MEM_USED * 100) / $MEM_TOTAL" | bc)
            echo -e "  Memoria Host:           ${MEM_USED}MB / ${MEM_TOTAL}MB $(color_value $MEM_PERCENT 75 90)"
        fi
        
        # Disco
        if command -v df &> /dev/null; then
            DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
            echo -e "  Disco Root (/):         $(color_value $DISK_USAGE 80 95)"
        fi
        
        echo ""
        draw_line
        echo -e "${YELLOW}💡 TIPS:${NC}"
        echo "  • Abre Grafana en http://localhost:3000 para gráficos en tiempo real"
        echo "  • Revisa logs con: docker logs -f [nombre-contenedor]"
        echo "  • Los datos se guardan en: $LOG_FILE"
        draw_line
        
        # Guardar en log
        TIMESTAMP=$(get_timestamp)
        BACKEND_CPU=$(get_container_cpu "deportes-backend" | tr -d '%')
        DB_CPU=$(get_container_cpu "mariadb" | tr -d '%')
        
        echo "$TIMESTAMP,$BACKEND_CPU,N/A,$DB_CPU,N/A,N/A,N/A,$DB_CONNECTIONS,$SLOW_QUERIES" >> $LOG_FILE
        
        # Esperar antes del siguiente refresh
        sleep $REFRESH_INTERVAL
    done
}

# Manejo de señal de interrupción
trap cleanup INT

cleanup() {
    echo ""
    echo ""
    draw_line
    echo -e "${GREEN}✅ Monitoreo detenido${NC}"
    echo -e "${YELLOW}📊 Los datos se han guardado en: $LOG_FILE${NC}"
    draw_line
    exit 0
}

# Ejecutar monitor
monitor
