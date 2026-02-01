# 🚀 GUÍA DE INICIO RÁPIDO - Pruebas de Desempeño

## 📦 Archivos Incluidos

1. **plan_pruebas_desempeno.md** - Plan detallado completo (LEER PRIMERO)
2. **docker-compose.monitoring.yml** - Stack de monitoreo completo
3. **prometheus.yml** - Configuración de Prometheus
4. **prometheus-alerts.yml** - Reglas de alertas
5. **jmeter-test-plan.jmx** - Test plan de JMeter con autenticación
6. **scripts/** - Scripts auxiliares

---

## ⚡ INICIO RÁPIDO (15 minutos)

### Paso 1: Preparar Estructura de Directorios

```bash
mkdir -p performance-testing
cd performance-testing

# Crear estructura
mkdir -p prometheus/rules
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards
mkdir -p scripts
mkdir -p results
```

### Paso 2: Mover Archivos

```bash
# Mover archivos de configuración
mv docker-compose.monitoring.yml ./
mv prometheus.yml ./prometheus/
mv prometheus-alerts.yml ./prometheus/rules/
```

### Paso 3: Configurar Datasource de Grafana

Crear archivo: `grafana/provisioning/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### Paso 4: Configurar Dashboards de Grafana

Crear archivo: `grafana/provisioning/dashboards/dashboard.yml`

```yaml
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

### Paso 5: Configurar Backend Spring Boot

Agregar en `application.yml`:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,metrics
  metrics:
    export:
      prometheus:
        enabled: true
```

Agregar en `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### Paso 6: Levantar Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d

# Verificar que todos los servicios están corriendo
docker-compose -f docker-compose.monitoring.yml ps
```

### Paso 7: Verificar Servicios

Abre en el navegador:

- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Backend Metrics**: http://localhost:8080/actuator/prometheus
- **Backend Health**: http://localhost:8080/actuator/health

### Paso 8: Crear Usuario de Prueba en tu Backend

```bash
# Usando curl o Postman, crear un usuario admin
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123!",
    "name": "Admin User"
  }'
```

### Paso 9: Ejecutar Primera Prueba con JMeter

```bash
# Instalar JMeter si no lo tienes
# Descargar de: https://jmeter.apache.org/download_jmeter.cgi

# Abrir JMeter
jmeter

# Cargar el archivo: jmeter-test-plan.jmx
# Ejecutar la prueba (botón verde de Play)
```

### Paso 10: Ver Métricas en Grafana

1. Ir a http://localhost:3000
2. Login: admin / admin123
3. Ir a "Explore"
4. Seleccionar datasource: "Prometheus"
5. Probar query: `rate(http_server_requests_seconds_count[1m])`

---

## 🎯 DASHBOARDS RECOMENDADOS

Importar estos dashboards en Grafana (Settings > Dashboards > Import):

1. **Spring Boot 2.1 Statistics** - ID: 11378
2. **JVM (Micrometer)** - ID: 4701
3. **MySQL Overview** - ID: 7362
4. **Node Exporter Full** - ID: 1860

---

## 📊 QUERIES PROMETHEUS MÁS ÚTILES

### Tiempo de Respuesta P95
```promql
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
)
```

### Throughput (req/s)
```promql
sum(rate(http_server_requests_seconds_count[1m])) by (uri)
```

### Tasa de Error
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) /
sum(rate(http_server_requests_seconds_count[5m])) * 100
```

### CPU Backend
```promql
100 - (avg(irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Conexiones de Base de Datos
```promql
mysql_global_status_threads_connected
```

---

## 🔧 TROUBLESHOOTING

### Prometheus no recolecta métricas

1. Verificar que el backend expone `/actuator/prometheus`
2. Verificar conectividad: `docker exec prometheus wget -O- http://backend:8080/actuator/prometheus`
3. Revisar targets en Prometheus: http://localhost:9090/targets

### Grafana no muestra datos

1. Verificar que el datasource está configurado
2. Probar query simple en Explore: `up`
3. Revisar logs: `docker logs grafana`

### JMeter falla en autenticación

1. Verificar que el endpoint `/api/v1/auth/login` existe
2. Verificar credenciales en el Setup Thread Group
3. Ver logs en "View Results Tree"
4. Verificar que el token se extrajo: Agregar Debug Sampler

---

## 📈 PRÓXIMOS PASOS

1. ✅ Verificar que todo funciona con 1-10 usuarios
2. ✅ Ejecutar Load Test con 50 usuarios (5 minutos)
3. ✅ Revisar métricas en Grafana
4. ✅ Ejecutar Stress Test incremental
5. ✅ Poblar DB con 5000+ registros
6. ✅ Ejecutar Volume Test
7. ✅ Analizar resultados y crear informe

---

## 📚 RECURSOS

- **Documentación completa**: Ver `plan_pruebas_desempeno.md`
- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **JMeter Docs**: https://jmeter.apache.org/usermanual/

---

## ⚠️ IMPORTANTE

- Este setup es para **TESTING**, NO para producción
- Cambiar contraseñas por defecto
- Ajustar límites de recursos según tu hardware
- Hacer backup de la base de datos antes de Volume Testing

---

## 💡 TIPS

1. Empezar con **pocos usuarios** y subir gradualmente
2. **Monitorear en tiempo real** en Grafana durante las pruebas
3. **Documentar** cada hallazgo inmediatamente
4. **Comparar** resultados entre JMeter y Gatling
5. **Optimizar** después de identificar cuellos de botella

---

¡Éxito con las pruebas! 🚀
