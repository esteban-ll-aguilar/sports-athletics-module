# 🔥 Pruebas de Estrés y Rendimiento - ISO 25010

Este directorio contiene la configuración completa para realizar pruebas de **Eficiencia de Desempeño** según la norma **ISO/IEC 25010**, utilizando herramientas como **JMeter**, **Gatling**, y monitoreo con **Prometheus** y **Grafana**.

## 📁 Estructura del Directorio

```
stress_tests/
├── docker-compose-stress.yml      # Docker Compose principal
├── README.md                      # Este archivo
│
├── jmeter/                        # Configuración de JMeter
│   ├── tests/                    # Planes de prueba (.jmx)
│   ├── results/                  # Resultados de ejecución
│   └── data/                     # Datos CSV para pruebas
│
├── gatling/                       # Configuración de Gatling
│   ├── simulations/              # Simulaciones en Scala
│   ├── resources/                # Datos y recursos
│   └── results/                  # Reportes HTML
│
├── prometheus/                    # Configuración de Prometheus
│   └── prometheus.yml            # Configuración de scraping
│
└── grafana/                       # Dashboards de Grafana
    ├── dashboards/               # Dashboards personalizados
    └── datasources/              # Fuentes de datos
```

## 🎯 Tipos de Pruebas

### 1. **Pruebas de Carga (Load Testing)**
Verifican el comportamiento del sistema bajo carga esperada (50 usuarios concurrentes).

**Objetivo**: Validar tiempos de respuesta aceptables en condiciones normales.

### 2. **Pruebas de Estrés (Stress Testing)**
Identifican el punto de ruptura del sistema (hasta 1000+ usuarios).

**Objetivo**: Determinar el límite operativo y comportamiento ante sobrecarga.

### 3. **Pruebas de Volumen (Volume Testing)**
Evalúan el rendimiento con grandes cantidades de datos (3000+ registros).

**Objetivo**: Detectar degradación por crecimiento de datos.

## 🚀 Inicio Rápido

### Levantar el Entorno de Pruebas

```bash
cd ci/stress_tests
docker-compose -f docker-compose-stress.yml up -d
```

Esto levantará:
- **JMeter** - Herramienta de pruebas de carga
- **Gatling** - Herramienta de pruebas de rendimiento
- **Prometheus** - Recolección de métricas (puerto 9090)
- **Grafana** - Visualización de métricas (puerto 3000)
- **cAdvisor** - Monitoreo de contenedores (puerto 8080)

### Acceso a las Herramientas

| Herramienta | URL | Credenciales |
|-------------|-----|--------------|
| **Grafana** | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | - |
| **cAdvisor** | http://localhost:8080 | - |

## 📊 Ejecutar Pruebas

### Opción 1: JMeter

#### Ejecutar Prueba de Carga
```bash
docker exec jmeter-stress-test jmeter -n -t /tests/load_test.jmx -l /results/load_test_results.jtl -e -o /results/load_test_report
```

#### Ver Resultados
```bash
# Los resultados estarán en: ci/stress_tests/jmeter/results/
```

### Opción 2: Gatling

#### Ejecutar Prueba de Carga
```bash
docker exec gatling-stress-test gatling.sh -sf /opt/gatling/user-files/simulations -s athletics.LoadTestSimulation
```

#### Ejecutar Prueba de Estrés
```bash
docker exec gatling-stress-test gatling.sh -sf /opt/gatling/user-files/simulations -s athletics.StressTestSimulation
```

#### Ver Reportes
```bash
# Los reportes HTML estarán en: ci/stress_tests/gatling/results/
```

## 📈 Monitoreo en Tiempo Real

### Usar Docker Stats
```bash
# Monitorear recursos de todos los contenedores
docker stats

# Monitorear solo los servicios de la aplicación
docker stats fastapi-app springboot-app postgres-db mariadb-db
```

### Usar cAdvisor
1. Accede a http://localhost:8080
2. Navega por los contenedores para ver métricas en tiempo real

### Usar Prometheus
1. Accede a http://localhost:9090
2. Ejecuta consultas PromQL para analizar métricas

### Usar Grafana
1. Accede a http://localhost:3000
2. Login: `admin` / `admin`
3. Importa dashboards predefinidos o crea los tuyos

## 🔧 Configuración de Pruebas

### Modificar Parámetros de JMeter

Edita `jmeter/tests/load_test.jmx` y ajusta:
- `NUM_USERS`: Número de usuarios concurrentes
- `RAMP_TIME`: Tiempo de rampa (segundos)
- `BASE_URL`: URL del servidor a probar

### Modificar Simulaciones de Gatling

Edita los archivos `.scala` en `gatling/simulations/`:

```scala
// Cambiar número de usuarios
rampUsers(100) during (10 seconds)

// Cambiar tasa de usuarios por segundo
constantUsersPerSec(50) during (30 seconds)

// Cambiar URL base
.baseUrl("http://host.docker.internal:8080")
```

## 📝 Métricas Clave a Monitorear

### Métricas de Rendimiento
- ✅ **Tiempo de Respuesta Promedio**: < 1000ms (óptimo)
- ✅ **Tiempo de Respuesta Máximo**: < 5000ms (aceptable)
- ✅ **Throughput**: Requests/segundo
- ✅ **Tasa de Error**: < 1% (óptimo)

### Métricas de Recursos (Docker Stats)
- ✅ **CPU Usage**: % de CPU utilizado
- ✅ **Memory Usage**: MB de RAM utilizado
- ✅ **Network I/O**: Tráfico de red
- ✅ **Block I/O**: Operaciones de disco

## 🎯 Escenarios de Prueba Recomendados

### Escenario 1: Carga Normal (50 usuarios)
```bash
# JMeter
docker exec jmeter-stress-test jmeter -n -t /tests/load_test.jmx -l /results/load_50.jtl

# Gatling
docker exec gatling-stress-test gatling.sh -s athletics.LoadTestSimulation
```

### Escenario 2: Estrés Moderado (100-500 usuarios)
```bash
# Modificar NUM_USERS en JMeter o usar Gatling
docker exec gatling-stress-test gatling.sh -s athletics.StressTestSimulation
```

### Escenario 3: Estrés Extremo (1000+ usuarios)
```bash
# Usar Gatling con configuración de estrés
docker exec gatling-stress-test gatling.sh -s athletics.StressTestSimulation
```

## 🛑 Detener el Entorno

```bash
cd ci/stress_tests
docker-compose -f docker-compose-stress.yml down
```

### Eliminar volúmenes (datos)
```bash
docker-compose -f docker-compose-stress.yml down -v
```

## 📊 Análisis de Resultados

### Interpretar Resultados de JMeter

Los archivos `.jtl` contienen:
- Timestamp de cada request
- Tiempo de respuesta
- Código de estado HTTP
- Tamaño de respuesta
- Success/Failure

### Interpretar Reportes de Gatling

Los reportes HTML incluyen:
- **Global Statistics**: Métricas generales
- **Response Time Distribution**: Distribución de tiempos
- **Requests per Second**: Throughput
- **Active Users**: Concurrencia

### Capturar Métricas de Docker

```bash
# Exportar métricas a archivo
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" > docker_stats.txt
```

## 🔍 Detección de Cuellos de Botella

### Indicadores de Problemas

1. **Tiempo de respuesta > 5s**: Posible saturación
2. **CPU > 80%**: Límite de procesamiento
3. **Memory > 90%**: Riesgo de OOM
4. **Tasa de error > 5%**: Sistema inestable

### Acciones Recomendadas

- ✅ Implementar **paginación** en endpoints GET
- ✅ Agregar **índices** en base de datos
- ✅ Implementar **caché** (Redis)
- ✅ Optimizar **consultas SQL**
- ✅ Escalar **horizontalmente** (más instancias)

## 📚 Referencias

- [ISO/IEC 25010:2011](https://www.iso.org/standard/35733.html) - Calidad de Software
- [Apache JMeter](https://jmeter.apache.org/) - Documentación oficial
- [Gatling](https://gatling.io/docs/) - Documentación oficial
- [Prometheus](https://prometheus.io/docs/) - Guía de monitoreo
- [Grafana](https://grafana.com/docs/) - Visualización de métricas

## 📝 Notas Importantes

1. **Entorno Local**: Los resultados dependen del hardware disponible
2. **Producción**: Métricas reales variarán según infraestructura cloud
3. **Baseline**: Establecer métricas base para comparación
4. **Iteración**: Ejecutar pruebas después de cada optimización
5. **Documentación**: Registrar configuración y resultados

## 🎓 Cumplimiento ISO 25010

Este conjunto de pruebas evalúa:

- ✅ **Comportamiento Temporal**: Tiempos de respuesta
- ✅ **Utilización de Recursos**: CPU, Memoria, Red
- ✅ **Capacidad**: Número máximo de usuarios concurrentes
- ✅ **Escalabilidad**: Comportamiento bajo carga creciente

---

**Desarrollado para**: Módulo de Deportes y Atletismo - UNL  
**Norma**: ISO/IEC 25010 - Eficiencia de Desempeño
