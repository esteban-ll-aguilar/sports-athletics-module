# 🔥 Sistema de Pruebas de Estrés y Rendimiento - Athletics Module

Sistema completo de pruebas de rendimiento según **ISO/IEC 25010** utilizando **Locust**, **JMeter**, **Gatling**, con monitoreo en tiempo real con **Prometheus** y **Grafana**.

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Herramientas de Testing](#-herramientas-de-testing)
- [Baselines de Rendimiento](#-baselines-de-rendimiento)
- [Ejecución de Pruebas](#-ejecución-de-pruebas)
- [Análisis de Resultados](#-análisis-de-resultados)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

🎯 **Tres herramientas de testing**: Locust (Python), JMeter (Java), Gatling (Scala)  
📊 **Monitoreo en tiempo real**: Prometheus + Grafana  
🤖 **Totalmente automatizado**: Población de datos, ejecución, análisis  
📈 **Baselines definidos**: SLAs y métricas de rendimiento documentadas  
🔄 **CI/CD ready**: GitHub Actions workflow incluido  
🐳 **Dockerizado**: Todo en contenedores, sin instalación local  

## 📁 Estructura del Proyecto

```
ci/stress_tests/
├── docker-compose-stress.yml       # Orquestador de servicios
├── README.md                       # Esta documentación
├── performance_baselines.yml       # SLAs y métricas esperadas
├── populate_database.py            # Poblador de datos de prueba
│
├── locust/                         # 🐝 Locust (Python) - PRINCIPAL
│   ├── locustfile.py              # Configuración principal
│   ├── scenarios.py               # Escenarios predefinidos
│   ├── locust.conf                # Configuración de escenarios
│   └── results/                   # Reportes y estadísticas
│
├── jmeter/                         # ☕ JMeter (Java)
│   ├── tests/
│   │   └── load_test.jmx          # Plan de pruebas
│   ├── data/
│   │   └── users.csv              # Datos de usuarios
│   └── results/                   # Archivos .jtl y reportes
│
├── gatling/                        # ⚡ Gatling (Scala)
│   ├── simulations/
│   │   ├── LoadTestSimulation.scala
│   │   └── StressTestSimulation.scala
│   ├── resources/
│   │   └── users.csv              # Feeders
│   └── results/                   # Reportes HTML
│
├── prometheus/                     # 📊 Métricas
│   └── prometheus.yml             # Configuración de scraping
│
├── grafana/                        # 📈 Visualización
│   └── provisioning/
│       ├── datasources/           # Prometheus datasource
│       └── dashboards/            # Dashboards precargados
│
└── utils/                          # 🛠️ Utilidades Python
    └── utils.py                   # Generadores de datos realistas
```

## 🚀 Inicio Rápido

### ⚠️ IMPORTANTE: Limitaciones Arquitectónicas

Este microservicio usa una **arquitectura de autenticación basada en roles** del servicio externo de usuarios. Por lo tanto:

**✅ Lo que SÍ funciona con usuario admin**:
- Crear/Leer/Actualizar competencias ← **Úsalo para stress testing**
- Leer listados de atletas, entrenadores
- Crear baremos, disciplinas, pruebas

**❌ Lo que NO funciona con admin**:
- Crear perfiles de atletas (requiere usuario con rol ATLETA)
- Crear entrenamientos (requiere usuario con rol ENTRENADOR)

📖 Ver [LIMITACIONES_POBLACION.md](LIMITACIONES_POBLACION.md) para detalles completos.

### Prerequisitos

- Docker y Docker Compose instalados
- Python 3.11+ (para scripts auxiliares)
- Puertos disponibles: 3000, 8080, 8089, 9090

### 1️⃣ Levantar Servicios de Monitoreo

```bash
cd ci/stress_tests
docker-compose -f docker-compose-stress.yml up -d
```

**Servicios disponibles**:
- 🐝 **Locust UI**: http://localhost:8089
- 📈 **Grafana**: http://localhost:3000 (admin/admin)
- 📊 **Prometheus**: http://localhost:9090
- 🐳 **cAdvisor**: http://localhost:8080

### 2️⃣ Verificar Backend está corriendo

```bash
# El API debe estar en http://localhost:8080
curl http://localhost:8080/health

# Verificar endpoint de métricas
curl http://localhost:8080/metrics
```

### 3️⃣ Poblar Base de Datos con Datos de Prueba

```bash
cd ci/stress_tests

# Instalar dependencias Python
pip install httpx faker pyyaml

# ✅ Generar archivos CSV con 100 usuarios
python populate_database.py --generate-csv --csv-users 100

# ✅ Crear 20 competencias (funciona con admin)
python populate_database.py --competencias 20

# ✅ Carga completa: 50 competencias + CSVs
python populate_database.py --full --generate-csv
```

**Output esperado**:
- ✅ Competencias: creadas exitosamente
- ⚠️ Atletas: 0 creados (esperado - requiere rol ATLETA del servicio externo)
- ⚠️ Entrenamientos: 0 creados (esperado - requiere rol ENTRENADOR)

Ver [arquitectura y limitaciones](#-arquitectura-y-limitaciones) para más detalles.
```

### 4️⃣ Ejecutar tu Primera Prueba

```bash
# Opción A: Locust con Web UI (Recomendado)
# Ve a http://localhost:8089 y configura usuarios

# Opción B: Locust en modo headless
cd ci/stress_tests
locust -f locust/locustfile.py \
    --host=http://localhost:8080 \
    --users 50 \
    --spawn-rate 10 \
    --run-time 5m \
    --headless \
    --html=locust/results/report.html
```

## 🛠️ Herramientas de Testing

### 🐝 Locust (Recomendado - Python)

**¿Por qué Locust?**
- ✅ Escrito en Python puro (fácil de mantener)
- ✅ Web UI en tiempo real
- ✅ Fácil integración con generadores de datos
- ✅ Soporte distribuido nativo

**Escenarios disponibles**:

```bash
# Smoke Test (10 usuarios, 2 minutos)
locust -f locust/locustfile.py --config locust.conf --config-users=smoke-test

# Load Test (100 usuarios, 10 minutos)
locust -f locust/locustfile.py --users 100 --spawn-rate 10 --run-time 10m

# Stress Test (500 usuarios, 15 minutos)
locust -f locust/locustfile.py --users 500 --spawn-rate 25 --run-time 15m

# Soak Test (150 usuarios, 60 minutos)
locust -f locust/locustfile.py --users 150 --spawn-rate 15 --run-time 60m
```

**Tipos de usuarios simulados**:
- `AthleticsWebsiteUser`: Usuario genérico navegando
- `AuthenticatedAtletaUser`: Atleta realizando CRUD
- `AuthenticatedEntrenadorUser`: Entrenador gestionando entrenamientos
- `MixedWorkloadUser`: Carga mixta realista

### ☕ JMeter (Java)

```bash
# Ejecutar test plan
docker exec jmeter-stress-test jmeter -n \
    -t /tests/load_test.jmx \
    -l /results/results.jtl \
    -e -o /results/report \
    -JNUM_USERS=50 \
    -JRAMP_TIME=30

# Ver resultados
open ci/stress_tests/jmeter/results/report/index.html
```

### ⚡ Gatling (Scala)

```bash
# Load Test
docker exec gatling-stress-test gatling.sh \
    -sf /opt/gatling/user-files/simulations \
    -s LoadTestSimulation

# Stress Test
docker exec gatling-stress-test gatling.sh \
    -sf /opt/gatling/user-files/simulations \
    -s StressTestSimulation

# Ver reportes
ls ci/stress_tests/gatling/results/
```

## 📊 Baselines de Rendimiento

Definidos en [`performance_baselines.yml`](performance_baselines.yml).

### 🎯 SLAs Principales

| Métrica | Objetivo | Warning | Critical |
|---------|----------|---------|----------|
| **Usuarios concurrentes** | 500 | 400 | 100 |
| **Throughput (req/s)** | 200 | 100 | 50 |
| **Login P95** | <800ms | <1500ms | <3000ms |
| **List Atletas P95** | <1000ms | <2000ms | <3000ms |
| **Error Rate** | <0.1% | <1% | <5% |
| **Availability** | 99.9% | 99.5% | 99% |
| **CPU Usage** | <70% | <85% | <95% |
| **Memory Usage** | <75% | <85% | <95% |

### 📈 Tiempos de Respuesta Esperados

**Autenticación** (crítico):
- Login: P50=300ms, P95=800ms, P99=1500ms
- Logout: P50=200ms, P95=500ms, P99=1000ms

**Lectura** (GET):
- List: P50=400ms, P95=1000ms, P99=2000ms
- Detail: P50=300ms, P95=800ms, P99=1500ms

**Escritura** (POST/PUT):
- Create: P50=500ms, P95=1500ms, P99=3000ms
- Update: P50=400ms, P95=1200ms, P99=2500ms

## 🔄 Ejecución de Pruebas

### Smoke Test (Verificación Rápida)

```bash
# Locust - 2 minutos, 10 usuarios
locust -f locust/locustfile.py \
    --host=http://localhost:8080 \
    --users 10 --spawn-rate 2 --run-time 2m \
    --headless --html=results/smoke.html
```

### Load Test (Carga Normal)

```bash
# Locust - 10 minutos, 100 usuarios
locust -f locust/locustfile.py \
    --host=http://localhost:8080 \
    --users 100 --spawn-rate 10 --run-time 10m \
    --headless --html=results/load.html
```

### Stress Test (Encontrar Límites)

```bash
# Locust - 15 minutos, 500 usuarios
locust -f locust/locustfile.py \
    --host=http://localhost:8080 \
    --users 500 --spawn-rate 25 --run-time 15m \
    --headless --html=results/stress.html
```

### Soak Test (Resistencia)

```bash
# Locust - 60 minutos, 150 usuarios
locust -f locust/locustfile.py \
    --host=http://localhost:8080 \
    --users 150 --spawn-rate 15 --run-time 60m \
    --headless --html=results/soak.html
```

### Modo Distribuido (Alta Escala)

```bash
# Master
locust -f locust/locustfile.py --master --expect-workers 4

# Workers (en otras terminales/máquinas)
locust -f locust/locustfile.py --worker --master-host=localhost
locust -f locust/locustfile.py --worker --master-host=localhost
locust -f locust/locustfile.py --worker --master-host=localhost
locust -f locust/locustfile.py --worker --master-host=localhost
```

## 📈 Análisis de Resultados

### Monitoreo en Tiempo Real con Grafana

1. Abrir Grafana: http://localhost:3000
2. Login: admin/admin
3. Navegar a Dashboards
4. Ver métricas en tiempo real durante pruebas

**Métricas clave a observar**:
- Response time (P50, P95, P99)
- Requests per second
- Error rate
- CPU/Memory usage
- Database connections

### Revisar Reportes de Locust

```bash
# Abrir reporte HTML
open locust/results/report.html

# Ver estadísticas CSV
cat locust/results/stats.csv
```

### Prometheus Queries Útiles

```promql
# Promedio de tiempo de respuesta
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Tasa de errores
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Requests por segundo
rate(http_requests_total[1m])

# P95 tiempo de respuesta
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

El workflow se ejecuta automáticamente en:
- ✅ Pull Requests (Smoke Test)
- ✅ Manualmente (cualquier tipo de test)
- ✅ Semanalmente (Load Test los domingos)

**Activación manual**:

1. Ve a Actions en GitHub
2. Selecciona "Stress Testing & Performance Validation"
3. Click en "Run workflow"
4. Selecciona parámetros:
   - Test type: smoke/load/stress
   - Users: 50/100/500
   - Duration: 5/10/15 minutos

**Validaciones automáticas**:
- ❌ Falla si error_rate > 5%
- ❌ Falla si P95 > baseline * 2
- ❌ Falla si availability < 99%
- ⚠️  Warning si hay regresión de rendimiento

### Resultados en PR

Los resultados se publican automáticamente como comentario en el PR con:
- 📊 Métricas principales
- ✅ Estado de pruebas
- 📈 Comparación con baseline
- 🔗 Enlaces a reportes detallados

## 🔧 Configuración Avanzada

### Personalizar Escenarios de Locust

Edita `locust/scenarios.py` para crear tus propios escenarios:

```python
from locust import HttpUser, task, between

class MyCustomUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def my_custom_test(self):
        self.client.get("/my/endpoint")
```

### Ajustar Baselines

Edita `performance_baselines.yml` para reflejar tus SLAs:

```yaml
response_times:
  auth:
    login:
      p95: 1000  # Cambiar a tu objetivo
```

### Agregar Nuevos Endpoints a JMeter

1. Abrir `jmeter/tests/load_test.jmx` con JMeter GUI
2. Agregar HTTP Request Samplers
3. Guardar y ejecutar

## 🐛 Troubleshooting

### Problema: Locust no puede conectarse al API

```bash
# Verificar que el API está corriendo
curl http://localhost:8080/health

# Si usas Docker, usar host.docker.internal
locust -f locust/locustfile.py --host=http://host.docker.internal:8080
```

### Problema: Errores 401 Unauthorized

```bash
# Verificar que los usuarios existen en la base de datos
# Repoblar datos:
python populate_database.py
```

### Problema: Prometheus no recolecta métricas

```bash
# Verificar endpoint de métricas
curl http://localhost:8080/metrics

# Verificar configuración de Prometheus
docker logs prometheus-metrics
```

### Problema: Out of Memory durante pruebas

```bash
# Reducir número de usuarios
locust -f locust/locustfile.py --users 50  # En lugar de 500

# O aumentar memoria de Docker
# Docker Desktop > Settings > Resources > Memory
```

## 📚 Recursos Adicionales

- [Documentación de Locust](https://docs.locust.io/)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Gatling Documentation](https://gatling.io/docs/current/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [ISO/IEC 25010](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010)

## 🏗️ Arquitectura y Limitaciones

### Flujo de Autenticación

La aplicación utiliza una arquitectura de microservicios:

1. **Servicio de Usuarios Externo**: Maneja registro y autenticación
2. **Athletics Module (este servicio)**: Maneja perfiles de atletas, entrenadores, competencias

### Endpoints y Permisos

| Endpoint | Método | Requiere Rol | Accesible por Admin |
|----------|--------|--------------|---------------------|
| `/api/v1/atleta/` | GET | Autenticado | ✅ Sí |
| `/api/v1/atleta/` | POST | ATLETA | ❌ No |
| `/api/v1/entrenador/entrenamientos/` | GET | ENTRENADOR | ❌ No |
| `/api/v1/entrenador/entrenamientos/` | POST | ENTRENADOR | ❌ No |
| `/api/v1/competencia/competencias` | GET | Autenticado | ✅ Sí |
| `/api/v1/competencia/competencias` | POST | ADMIN/ENTRENADOR | ✅ Sí |

### Implicaciones para Testing

**✅ Lo que SÍ funciona con usuario admin**:
- Listar atletas, entrenadores (lectura)
- Crear/Editar/Eliminar competencias
- Crear/Ver resultados de competencias
- Gestionar baremos y disciplinas

**❌ Lo que NO funciona con usuario admin**:
- Crear perfiles de atletas (requiere rol ATLETA en el usuario)
- Crear entrenamientos (requiere rol ENTRENADOR)

**Solución para Stress Testing**:
1. Usar endpoints de lectura (GET) para la mayoría de tests
2. Crear competencias masivamente (funciona con admin)
3. Generar CSVs con credenciales de usuarios pre-registrados en el servicio externo
4. Usar esos usuarios en JMeter/Gatling para tests de escritura

## 🤝 Contribuir

Para agregar nuevas pruebas o mejorar las existentes:

1. Agregar escenarios en `locust/scenarios.py`
2. Actualizar baselines en `performance_baselines.yml`
3. Documentar cambios en este README
4. Ejecutar smoke test para validar
5. Submit PR

## 📝 Notas

- **Recomendación**: Usar Locust como herramienta principal (más fácil de mantener)
- **JMeter y Gatling**: Mantener para compatibilidad y comparación
- **Baselines**: Actualizar cada 3 meses basándose en métricas reales
- **CI/CD**: Ajustar umbrales en `.github/workflows/stress-tests.yml` según necesidad
- **Población de datos**: Script optimizado para endpoints accesibles por ADMIN

## 📞 Soporte

Para problemas o preguntas:
- Abrir issue en GitHub
- Revisar logs: `docker-compose -f docker-compose-stress.yml logs`
- Verificar salud de servicios: `docker-compose -f docker-compose-stress.yml ps`

---

**Última actualización**: Febrero 2026  
**Versión**: 2.0.0  
**Maintainers**: DevOps Team
