# 📊 GUÍA DE QUERIES PROMETHEUS PARA GRAFANA
## Queries PromQL Más Útiles para Análisis de Desempeño

---

## 🎯 MÉTRICAS DE TIEMPO DE RESPUESTA

### 1. Tiempo de Respuesta Promedio (por endpoint)
```promql
rate(http_server_requests_seconds_sum{uri!~"/actuator.*"}[5m]) /
rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[5m])
```
**Uso**: Panel tipo "Graph" o "Time series"
**Descripción**: Muestra el tiempo de respuesta promedio en segundos para cada endpoint
**Umbral recomendado**: < 3 segundos

### 2. Percentil 95 de Tiempo de Respuesta
```promql
histogram_quantile(0.95,
  sum(rate(http_server_requests_seconds_bucket{uri!~"/actuator.*"}[5m])) by (uri, le)
) * 1000
```
**Uso**: Panel tipo "Graph" con unidad "ms"
**Descripción**: El 95% de las peticiones responden en este tiempo o menos
**Umbral recomendado**: < 2000ms (2 segundos)

### 3. Percentil 99 de Tiempo de Respuesta
```promql
histogram_quantile(0.99,
  sum(rate(http_server_requests_seconds_bucket{uri!~"/actuator.*"}[5m])) by (uri, le)
) * 1000
```
**Uso**: Panel tipo "Graph" con unidad "ms"
**Descripción**: El 99% de las peticiones responden en este tiempo o menos
**Umbral recomendado**: < 5000ms (5 segundos)

### 4. Comparación de Percentiles (P50, P95, P99)
```promql
# P50
histogram_quantile(0.50, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# P95
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# P99
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))
```
**Uso**: Panel tipo "Graph" con múltiples queries
**Descripción**: Vista comparativa de los diferentes percentiles

---

## 📈 MÉTRICAS DE THROUGHPUT Y VOLUMEN

### 5. Requests por Segundo (Total)
```promql
sum(rate(http_server_requests_seconds_count[1m]))
```
**Uso**: Panel tipo "Stat" o "Graph"
**Descripción**: Total de requests procesados por segundo
**Objetivo**: > 100 req/s en carga normal

### 6. Requests por Segundo (por endpoint)
```promql
sum(rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[1m])) by (uri)
```
**Uso**: Panel tipo "Graph" con múltiples series
**Descripción**: Desglose de requests por endpoint

### 7. Top 10 Endpoints Más Usados
```promql
topk(10,
  sum(rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[5m])) by (uri)
)
```
**Uso**: Panel tipo "Table" o "Bar gauge"
**Descripción**: Los 10 endpoints con más tráfico

### 8. Distribución de Requests por Método HTTP
```promql
sum(rate(http_server_requests_seconds_count[5m])) by (method)
```
**Uso**: Panel tipo "Pie chart"
**Descripción**: Proporción de GET, POST, PUT, DELETE, etc.

---

## ❌ MÉTRICAS DE ERRORES

### 9. Tasa de Error Global (%)
```promql
(
  sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) /
  sum(rate(http_server_requests_seconds_count[5m]))
) * 100
```
**Uso**: Panel tipo "Stat" con threshold
**Descripción**: Porcentaje de requests con error 5xx
**Umbral crítico**: > 5%

### 10. Tasa de Error por Endpoint
```promql
(
  sum(rate(http_server_requests_seconds_count{status=~"5..", uri!~"/actuator.*"}[5m])) by (uri) /
  sum(rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[5m])) by (uri)
) * 100
```
**Uso**: Panel tipo "Table" o "Bar gauge"
**Descripción**: Qué endpoints tienen más errores

### 11. Conteo de Errores 4xx vs 5xx
```promql
# Errores 4xx (cliente)
sum(rate(http_server_requests_seconds_count{status=~"4.."}[5m]))

# Errores 5xx (servidor)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
```
**Uso**: Panel tipo "Graph" con dos queries
**Descripción**: Diferenciar errores de cliente vs servidor

### 12. Endpoints con Errores Recientes
```promql
sum(increase(http_server_requests_seconds_count{status=~"5.."}[5m])) by (uri, status) > 0
```
**Uso**: Panel tipo "Table"
**Descripción**: Endpoints que han tenido errores en los últimos 5 minutos

---

## 💻 MÉTRICAS DE CPU Y MEMORIA

### 13. CPU Usage - Backend
```promql
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```
**Uso**: Panel tipo "Gauge" con thresholds (70%, 85%)
**Descripción**: Porcentaje de CPU usado por el backend
**Umbral crítico**: > 90%

### 14. Memoria Usada - Backend (%)
```promql
(
  (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) /
  node_memory_MemTotal_bytes
) * 100
```
**Uso**: Panel tipo "Gauge"
**Descripción**: Porcentaje de memoria RAM usada
**Umbral crítico**: > 85%

### 15. JVM Heap Memory Usage
```promql
(
  jvm_memory_used_bytes{area="heap"} /
  jvm_memory_max_bytes{area="heap"}
) * 100
```
**Uso**: Panel tipo "Graph" + "Gauge"
**Descripción**: Uso de memoria heap de Java
**Umbral crítico**: > 80%

### 16. JVM Garbage Collection Pause Time
```promql
rate(jvm_gc_pause_seconds_sum[5m]) /
rate(jvm_gc_pause_seconds_count[5m])
```
**Uso**: Panel tipo "Graph"
**Descripción**: Tiempo promedio de pausa por GC
**Objetivo**: < 50ms

---

## 🗄️ MÉTRICAS DE BASE DE DATOS

### 17. Conexiones Activas a MariaDB
```promql
mysql_global_status_threads_connected
```
**Uso**: Panel tipo "Graph" + "Stat"
**Descripción**: Número de conexiones activas
**Umbral crítico**: Cerca del max_connections

### 18. Porcentaje de Uso del Pool de Conexiones
```promql
(
  mysql_global_status_threads_connected /
  mysql_global_variables_max_connections
) * 100
```
**Uso**: Panel tipo "Gauge"
**Descripción**: Qué tan saturado está el pool
**Umbral crítico**: > 80%

### 19. Queries Lentas por Segundo
```promql
rate(mysql_global_status_slow_queries[5m])
```
**Uso**: Panel tipo "Graph"
**Descripción**: Tasa de queries lentas
**Umbral recomendado**: < 1 por segundo

### 20. InnoDB Buffer Pool Hit Rate
```promql
(
  (mysql_global_status_innodb_buffer_pool_read_requests - mysql_global_status_innodb_buffer_pool_reads) /
  mysql_global_status_innodb_buffer_pool_read_requests
) * 100
```
**Uso**: Panel tipo "Gauge"
**Descripción**: Eficiencia del buffer pool
**Objetivo**: > 95%

### 21. Queries por Segundo
```promql
rate(mysql_global_status_queries[1m])
```
**Uso**: Panel tipo "Graph"
**Descripción**: Throughput de la base de datos

### 22. Deadlocks Detectados
```promql
rate(mysql_global_status_innodb_deadlocks[5m])
```
**Uso**: Panel tipo "Graph"
**Descripción**: Frecuencia de deadlocks
**Objetivo**: 0 o muy cercano a 0

---

## 🌐 MÉTRICAS ESPECÍFICAS POR ENDPOINT

### 23. Performance del Endpoint de Login
```promql
# Tiempo de respuesta
histogram_quantile(0.95,
  sum(rate(http_server_requests_seconds_bucket{uri="/api/v1/auth/login"}[5m])) by (le)
) * 1000

# Tasa de éxito
(
  sum(rate(http_server_requests_seconds_count{uri="/api/v1/auth/login", status="200"}[5m])) /
  sum(rate(http_server_requests_seconds_count{uri="/api/v1/auth/login"}[5m]))
) * 100
```
**Uso**: Panel dedicado para login
**Descripción**: Métricas críticas del endpoint más importante

### 24. Performance de GET vs POST
```promql
# Tiempo promedio GET
rate(http_server_requests_seconds_sum{method="GET"}[5m]) /
rate(http_server_requests_seconds_count{method="GET"}[5m])

# Tiempo promedio POST
rate(http_server_requests_seconds_sum{method="POST"}[5m]) /
rate(http_server_requests_seconds_count{method="POST"}[5m])
```
**Uso**: Panel comparativo
**Descripción**: Identificar si GET o POST son más lentos

### 25. Endpoints Más Lentos (Top 10)
```promql
topk(10,
  rate(http_server_requests_seconds_sum{uri!~"/actuator.*"}[5m]) /
  rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[5m])
)
```
**Uso**: Panel tipo "Table"
**Descripción**: Los 10 endpoints con mayor tiempo de respuesta

---

## 🚨 ALERTAS Y MONITOREO

### 26. Requests Fallidos Recientes
```promql
increase(http_server_requests_seconds_count{status=~"5.."}[5m]) > 10
```
**Uso**: Alert rule
**Descripción**: Más de 10 errores 5xx en 5 minutos

### 27. Servicio Caído (Backend)
```promql
up{job="spring-boot-app"} == 0
```
**Uso**: Alert rule crítica
**Descripción**: El backend no está respondiendo

### 28. Servicio Caído (Base de Datos)
```promql
up{job="mysql"} == 0
```
**Uso**: Alert rule crítica
**Descripción**: La base de datos no está respondiendo

### 29. Latencia Excesiva (> 5 segundos)
```promql
histogram_quantile(0.95,
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
) > 5
```
**Uso**: Alert rule
**Descripción**: Algún endpoint supera los 5 segundos en P95

---

## 📊 DASHBOARDS COMPUESTOS

### 30. Vista General del Sistema (Single Stat Panel)
```promql
# Total Requests (últimos 5min)
sum(increase(http_server_requests_seconds_count[5m]))

# Tasa de Error
(sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m]))) * 100

# Tiempo de Respuesta Promedio
rate(http_server_requests_seconds_sum[5m]) / rate(http_server_requests_seconds_count[5m])

# Uptime (%)
avg(up) * 100
```
**Uso**: Panel de vista rápida con 4 stats
**Descripción**: KPIs principales del sistema

### 31. Comparación Load vs Stress vs Volume
```promql
# Usar variables de Grafana
avg(rate(http_server_requests_seconds_sum{test_type="$test_type"}[5m])) by (test_type)
```
**Uso**: Variable `$test_type` con valores: load, stress, volume
**Descripción**: Comparar resultados de diferentes pruebas

### 32. Detección de Anomalías (Tiempo de Respuesta)
```promql
(
  rate(http_server_requests_seconds_sum[5m]) /
  rate(http_server_requests_seconds_count[5m])
) > 
(
  avg_over_time(
    (rate(http_server_requests_seconds_sum[5m]) /
    rate(http_server_requests_seconds_count[5m]))[1h:]
  ) * 1.5
)
```
**Uso**: Panel de alertas
**Descripción**: Detecta cuando el tiempo de respuesta es 50% mayor que el promedio de la última hora

---

## 🎨 TIPS PARA PANELES EN GRAFANA

### Configuración Recomendada:

**Para Tiempo de Respuesta:**
- Unidad: `ms` (milliseconds)
- Thresholds: 500ms (verde), 2000ms (amarillo), 5000ms (rojo)
- Visualización: Time series con línea suave

**Para Tasa de Error:**
- Unidad: `percent (0-100)`
- Thresholds: 1% (verde), 5% (amarillo), 10% (rojo)
- Visualización: Stat con gauge

**Para Throughput:**
- Unidad: `ops` (operations per second)
- Visualización: Time series con área

**Para CPU/Memoria:**
- Unidad: `percent (0-100)`
- Thresholds: 70% (verde), 85% (amarillo), 95% (rojo)
- Visualización: Gauge

---

## 🔍 DEBUGGING QUERIES

### 33. Verificar que Prometheus está Scraping
```promql
up
```
**Resultado esperado**: 1 para todos los targets

### 34. Ver Todas las Métricas Disponibles
```promql
# En Explore, simplemente escribe:
http_server_requests_seconds_count

# Prometheus autocompletará todas las métricas disponibles
```

### 35. Verificar Targets que Están Fallando
```promql
up == 0
```

---

## 📝 VARIABLES ÚTILES EN GRAFANA

Crear estas variables en Dashboard Settings > Variables:

**1. Endpoint Selector:**
```
Name: endpoint
Label: Endpoint
Type: Query
Query: label_values(http_server_requests_seconds_count, uri)
Refresh: On time range change
```

**2. Time Window:**
```
Name: timewindow
Label: Time Window
Type: Custom
Values: 1m, 5m, 15m, 30m, 1h
Current: 5m
```

**3. Percentile:**
```
Name: percentile
Label: Percentile
Type: Custom
Values: 0.50, 0.75, 0.95, 0.99
Current: 0.95
```

Luego úsalas así:
```promql
histogram_quantile($percentile,
  sum(rate(http_server_requests_seconds_bucket{uri="$endpoint"}[$timewindow])) by (le)
)
```

---

## 💡 MEJORES PRÁCTICAS

1. **Usar rangos de tiempo apropiados**: `[5m]` para dashboards en tiempo real, `[1h]` para análisis histórico

2. **Evitar queries muy complejas**: Divídelas en múltiples paneles más simples

3. **Usar `rate()` para contadores**: Siempre que veas `_total` o `_count`, usa `rate()`

4. **Filtrar métricas de Actuator**: Añadir `{uri!~"/actuator.*"}` para excluir ruido

5. **Establecer thresholds visuales**: Ayuda a identificar problemas rápidamente

6. **Crear alertas progresivas**: Warning (5%) → Critical (10%)

7. **Documentar paneles**: Añadir descripciones en cada panel explicando qué mide

---

¡Con estas queries tendrás un dashboard completo y profesional para analizar el desempeño de tu API! 🚀
