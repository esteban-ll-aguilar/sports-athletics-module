# PLAN DETALLADO DE PRUEBAS DE DESEMPEÑO
## Sistema de Gestión Deportiva - Integración con Grafana & Prometheus

---

## 📋 ÍNDICE

1. [Clasificación de Endpoints por Criticidad](#1-clasificación-de-endpoints-por-criticidad)
2. [Configuración de Prometheus y Grafana](#2-configuración-de-prometheus-y-grafana)
3. [Estrategia de Autenticación para Rutas Protegidas](#3-estrategia-de-autenticación-para-rutas-protegidas)
4. [Plan de Pruebas por Tipo](#4-plan-de-pruebas-por-tipo)
5. [Configuración de JMeter](#5-configuración-de-jmeter)
6. [Configuración de Gatling](#6-configuración-de-gatling)
7. [Dashboards de Grafana](#7-dashboards-de-grafana)
8. [Métricas a Monitorear](#8-métricas-a-monitorear)
9. [Interpretación de Resultados](#9-interpretación-de-resultados)
10. [Plan de Ejecución Timeline](#10-plan-de-ejecución-timeline)

---

## 1. CLASIFICACIÓN DE ENDPOINTS POR CRITICIDAD

### 🔴 CRITICIDAD ALTA (Prioridad 1)
**Endpoints que afectan directamente la experiencia del usuario y son de uso frecuente**

#### Autenticación (Auth V1)
```
POST /api/v1/auth/login                    - Login principal
POST /api/v1/auth/register                 - Registro de usuarios
POST /api/v1/auth/refresh                  - Renovación de tokens
GET  /api/v1/auth/users/me                 - Perfil del usuario
```

**Justificación**: Sin autenticación funcional, el sistema completo falla.

#### Atletas
```
GET  /api/v1/atleta/                       - Listar atletas
GET  /api/v1/atleta/historial-medico/me    - Historial médico propio
```

**Justificación**: Funcionalidad core del sistema deportivo.

#### Entrenamientos
```
GET  /api/v1/entrenador/entrenamientos/    - Listar entrenamientos
POST /api/v1/entrenador/entrenamientos/    - Crear entrenamiento
GET  /api/v1/entrenador/asistencias/mis-registros - Ver mis asistencias
```

**Justificación**: Operación diaria crítica para entrenadores y atletas.

---

### 🟡 CRITICIDAD MEDIA (Prioridad 2)
**Endpoints importantes pero con uso menos frecuente**

#### Competencias
```
GET  /api/v1/competencia/competencias      - Listar competencias
POST /api/v1/competencia/competencias      - Crear competencia
GET  /api/v1/competencia/resultados        - Listar resultados
```

#### Asistencias
```
POST /api/v1/entrenador/asistencias/registro         - Registrar asistencia
POST /api/v1/entrenador/asistencias/confirmar/{id}   - Confirmar asistencia
PUT  /api/v1/entrenador/asistencias/marcar-presente/{id} - Marcar presente
```

#### Representantes
```
GET  /api/v1/representante/athletes        - Listar atletas hijos
POST /api/v1/representante/athletes        - Registrar atleta hijo
```

---

### 🟢 CRITICIDAD BAJA (Prioridad 3)
**Endpoints administrativos o de uso esporádico**

#### Administración
```
GET  /api/v1/auth/users/                   - Listar usuarios (admin)
PUT  /api/v1/auth/users/{user_id}/role     - Actualizar rol
POST /api/v1/admin/jwt/rotate-secret       - Rotar secreto JWT
```

#### Configuraciones
```
POST /api/v1/competencia/baremos/          - Crear baremo
POST /api/v1/competencia/tipo-disciplina/  - Crear tipo disciplina
```

---

## 2. CONFIGURACIÓN DE PROMETHEUS Y GRAFANA

### 2.1 Arquitectura del Stack de Monitoreo

```
┌─────────────────┐
│   JMeter/       │
│   Gatling       │──┐
└─────────────────┘  │
                     │
┌─────────────────┐  │  ┌─────────────────┐
│   Spring Boot   │  │  │   Prometheus    │
│   Application   │──┼─▶│   Exporter      │
│   (Backend)     │  │  │                 │
└─────────────────┘  │  └─────────────────┘
                     │           │
┌─────────────────┐  │           │
│   MariaDB       │  │           ▼
│   (Database)    │──┘  ┌─────────────────┐
└─────────────────┘     │   Prometheus    │
                        │   Server        │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │    Grafana      │
                        │   Dashboard     │
                        └─────────────────┘
```

### 2.2 Docker Compose - Stack Completo

**Archivo: `docker-compose.monitoring.yml`**

```yaml
version: '3.8'

services:
  # Tu aplicación Spring Boot existente
  backend:
    image: tu-backend-spring:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=monitoring
      - MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,prometheus,metrics
      - MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true
    networks:
      - monitoring-net

  # Base de datos MariaDB
  mariadb:
    image: mariadb:latest
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: deportes_db
    ports:
      - "3306:3306"
    networks:
      - monitoring-net

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - "9090:9090"
    networks:
      - monitoring-net
    restart: unless-stopped

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3000:3000"
    networks:
      - monitoring-net
    depends_on:
      - prometheus
    restart: unless-stopped

  # MySQL Exporter para métricas de MariaDB
  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    environment:
      - DATA_SOURCE_NAME=root:rootpass@(mariadb:3306)/
    ports:
      - "9104:9104"
    networks:
      - monitoring-net
    depends_on:
      - mariadb
    restart: unless-stopped

  # Node Exporter para métricas del sistema
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    networks:
      - monitoring-net
    restart: unless-stopped

networks:
  monitoring-net:
    driver: bridge

volumes:
  prometheus-data:
  grafana-data:
```

### 2.3 Configuración de Prometheus

**Archivo: `prometheus/prometheus.yml`**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'deportes-app'
    environment: 'testing'

# Reglas de alertas
rule_files:
  - '/etc/prometheus/rules/*.yml'

# Configuración de scraping
scrape_configs:
  # Scraping del backend Spring Boot
  - job_name: 'spring-boot-app'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 5s
    static_configs:
      - targets: ['backend:8080']
        labels:
          application: 'deportes-backend'
          
  # Scraping de MariaDB
  - job_name: 'mysql'
    scrape_interval: 10s
    static_configs:
      - targets: ['mysql-exporter:9104']
        labels:
          application: 'mariadb'
          
  # Scraping del sistema (CPU, RAM, Disco)
  - job_name: 'node'
    scrape_interval: 10s
    static_configs:
      - targets: ['node-exporter:9100']
        labels:
          application: 'system-metrics'
          
  # Scraping de Prometheus mismo
  - job_name: 'prometheus'
    scrape_interval: 30s
    static_configs:
      - targets: ['localhost:9090']
```

### 2.4 Configuración de Spring Boot para Métricas

**Archivo: `application-monitoring.yml`**

```yaml
spring:
  application:
    name: deportes-api

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
      base-path: /actuator
  
  endpoint:
    health:
      show-details: always
    prometheus:
      enabled: true
    metrics:
      enabled: true
  
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
    distribution:
      percentiles-histogram:
        http.server.requests: true
      percentiles:
        http.server.requests: 0.5, 0.95, 0.99
      slo:
        http.server.requests: 100ms, 500ms, 1s, 2s, 5s

  health:
    db:
      enabled: true
    diskspace:
      enabled: true

# Configuración de logging para debugging
logging:
  level:
    io.micrometer: DEBUG
    org.springframework.web: DEBUG
```

### 2.5 Dependencias de Spring Boot (pom.xml)

```xml
<!-- Actuator para exponer métricas -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Micrometer Prometheus Registry -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

<!-- Opcional: Para métricas adicionales -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-core</artifactId>
</dependency>
```

---

## 3. ESTRATEGIA DE AUTENTICACIÓN PARA RUTAS PROTEGIDAS

### 3.1 Problema: Rutas que Requieren Autenticación

La mayoría de tus endpoints requieren un **JWT token** en el header. Necesitas:
1. Autenticarte primero
2. Extraer el token
3. Usarlo en las siguientes peticiones

### 3.2 Solución con JMeter

**Paso 1: Crear un Thread Group de Setup para Login**

```
Test Plan
└── setUp Thread Group (Runs before test)
    └── HTTP Request: Login
        └── JSON Extractor (Captura el token)
    └── User Defined Variables (Almacena el token globalmente)
```

**Configuración JMeter detallada:**

#### A. Setup Thread Group (Pre-Test)

```
Thread Group Settings:
- Number of Threads: 1
- Ramp-up Period: 0
- Loop Count: 1
- Action to be taken after a Sampler error: Start Next Thread Loop
```

#### B. HTTP Request - Login

```
HTTP Request:
- Server Name: localhost
- Port: 8080
- Method: POST
- Path: /api/v1/auth/login
- Content encoding: UTF-8

Body Data (JSON):
{
  "email": "admin@test.com",
  "password": "Admin123!"
}

HTTP Header Manager:
- Content-Type: application/json
```

#### C. JSON Extractor (Capturar Token)

```
JSON Extractor:
- Names of created variables: access_token
- JSON Path expressions: $.access_token
- Match No.: 1
- Default Values: TOKEN_NOT_FOUND
```

#### D. BeanShell PostProcessor (Hacer token global)

```groovy
// Guardar el token como propiedad global
String token = vars.get("access_token");
if (token != null && !token.equals("TOKEN_NOT_FOUND")) {
    props.put("AUTH_TOKEN", token);
    log.info("Token guardado: " + token.substring(0, 20) + "...");
} else {
    log.error("No se pudo obtener el token");
}
```

#### E. HTTP Header Manager (Para todas las peticiones protegidas)

```
HTTP Header Manager (Aplicado al Thread Group principal):
- Name: Authorization
- Value: Bearer ${__P(AUTH_TOKEN)}
```

### 3.3 Solución con Gatling

**Archivo: `AuthScenario.scala`**

```scala
package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

object AuthScenario {
  
  // Configuración HTTP base
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  // Feeder con credenciales (puedes usar CSV también)
  val credentials = Map(
    "email" -> "admin@test.com",
    "password" -> "Admin123!"
  )

  // Escenario de login y captura de token
  val login = exec(
    http("Login")
      .post("/api/v1/auth/login")
      .body(StringBody(
        """{
          "email": "${email}",
          "password": "${password}"
        }"""
      ))
      .check(status.is(200))
      .check(jsonPath("$.access_token").saveAs("authToken"))
  )
  .exec { session =>
    val token = session("authToken").as[String]
    println(s"Token capturado: ${token.take(20)}...")
    session
  }

  // Función helper para crear requests autenticados
  def authenticatedRequest(name: String, method: String, path: String) = {
    exec(
      http(name)
        .httpRequest(method, path)
        .header("Authorization", "Bearer ${authToken}")
        .check(status.is(200))
    )
  }
}
```

**Archivo: `LoadTestSimulation.scala`**

```scala
package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._
import AuthScenario._

class LoadTestSimulation extends Simulation {

  // Usuarios desde CSV
  val usersFeeder = csv("users.csv").circular

  // Escenario completo: Login + operaciones
  val scn = scenario("Prueba de Carga con Auth")
    .feed(usersFeeder)
    .exec(login) // Primero hacer login
    .pause(1)
    .exec(
      authenticatedRequest("Listar Atletas", "GET", "/api/v1/atleta/")
    )
    .pause(2)
    .exec(
      authenticatedRequest("Ver mi perfil", "GET", "/api/v1/auth/users/me")
    )
    .pause(1)
    .exec(
      authenticatedRequest("Listar Entrenamientos", "GET", "/api/v1/entrenador/entrenamientos/")
    )

  // Setup de carga
  setUp(
    scn.inject(
      nothingFor(5.seconds),
      rampUsers(50) during(30.seconds),
      constantUsersPerSec(10) during(60.seconds)
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.max.lt(5000),
     global.successfulRequests.percent.gt(95)
   )
}
```

### 3.4 Archivo CSV de Usuarios para Pruebas

**Archivo: `users.csv`**

```csv
email,password
user1@test.com,Password123!
user2@test.com,Password123!
user3@test.com,Password123!
admin@test.com,Admin123!
entrenador1@test.com,Password123!
atleta1@test.com,Password123!
representante1@test.com,Password123!
```

---

## 4. PLAN DE PRUEBAS POR TIPO

### 4.1 LOAD TESTING (Pruebas de Carga)

**Objetivo**: Verificar comportamiento bajo carga esperada.

#### Escenario 1: Uso Normal del Sistema

**Endpoints a probar:**
```
POST /api/v1/auth/login                    - 100 usuarios/min
GET  /api/v1/atleta/                       - 80 usuarios/min
GET  /api/v1/entrenador/entrenamientos/    - 60 usuarios/min
GET  /api/v1/auth/users/me                 - 50 usuarios/min
GET  /api/v1/competencia/competencias      - 40 usuarios/min
```

**Configuración:**
- **Usuarios concurrentes**: 50
- **Ramp-up**: 30 segundos
- **Duración**: 5 minutos
- **Think time**: 2-5 segundos entre requests

**Criterios de éxito:**
- Tiempo de respuesta promedio < 3 segundos (operaciones simples)
- Tiempo de respuesta promedio < 5 segundos (operaciones complejas)
- Tasa de error < 1%
- CPU Backend < 70%
- CPU Database < 60%

#### Escenario 2: Carga Moderada

**Configuración:**
- **Usuarios concurrentes**: 100
- **Ramp-up**: 60 segundos
- **Duración**: 10 minutos

**Criterios de éxito:**
- Tiempo de respuesta promedio < 5 segundos
- Tasa de error < 3%
- CPU Backend < 80%

### 4.2 STRESS TESTING (Pruebas de Estrés)

**Objetivo**: Identificar el punto de ruptura.

#### Escenario 1: Incremento Progresivo

**Configuración:**
```
Fase 1: 50 usuarios   (2 min)
Fase 2: 100 usuarios  (2 min)
Fase 3: 200 usuarios  (2 min)
Fase 4: 400 usuarios  (2 min)
Fase 5: 800 usuarios  (2 min)
Fase 6: 1000 usuarios (hasta que falle)
```

**Endpoints críticos:**
```
POST /api/v1/auth/login
GET  /api/v1/atleta/
POST /api/v1/entrenador/asistencias/registro
```

**Qué observar:**
- ¿En qué punto los tiempos de respuesta explotan?
- ¿En qué punto las tasas de error superan el 5%?
- ¿Cuándo el CPU llega al 100%?
- ¿Hay memory leaks?

#### Escenario 2: Spike Test (Pico súbito)

**Configuración:**
```
0-30s:   10 usuarios
30-35s:  500 usuarios (spike)
35-60s:  10 usuarios (recuperación)
```

**Qué observar:**
- ¿El sistema se recupera después del spike?
- ¿Hay peticiones que quedan colgadas?

### 4.3 VOLUME TESTING (Pruebas de Volumen)

**Objetivo**: Evaluar comportamiento con grandes volúmenes de datos.

#### Preparación de Datos

**Script SQL para poblar base de datos:**

```sql
-- Generar 5000 atletas
INSERT INTO atletas (nombre, email, edad, external_id)
SELECT 
  CONCAT('Atleta ', n),
  CONCAT('atleta', n, '@test.com'),
  FLOOR(15 + RAND() * 20),
  UUID()
FROM (
  SELECT @row := @row + 1 AS n
  FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t1,
       (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t2,
       (SELECT @row := 0) r
  LIMIT 5000
) numbers;

-- Generar 10000 entrenamientos
INSERT INTO entrenamientos (nombre, descripcion, fecha, external_id)
SELECT 
  CONCAT('Entrenamiento ', n),
  CONCAT('Descripción del entrenamiento ', n),
  DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 365) DAY),
  UUID()
FROM (
  SELECT @row2 := @row2 + 1 AS n
  FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t1,
       (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t2,
       (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t3,
       (SELECT @row2 := 0) r
  LIMIT 10000
) numbers;
```

#### Escenarios de Prueba

**Escenario 1: Consultas con paginación**
```
GET /api/v1/atleta/?page=1&size=20       - Con 5000 registros
GET /api/v1/atleta/?page=50&size=20      - Página intermedia
GET /api/v1/atleta/?page=250&size=20     - Última página
```

**Escenario 2: Consultas sin paginación (peor caso)**
```
GET /api/v1/atleta/                      - Todos los registros
```

**Configuración:**
- **Usuarios concurrentes**: 50
- **Registros en DB**: 5000+
- **Duración**: 5 minutos

**Criterios de éxito:**
- Con paginación: < 5 segundos
- Sin paginación: Identificar si es viable

---

## 5. CONFIGURACIÓN DE JMETER

### 5.1 Estructura del Test Plan

```
Test Plan
├── User Defined Variables
│   ├── HOST = localhost
│   ├── PORT = 8080
│   └── BASE_PATH = /api/v1
│
├── setUp Thread Group (Login)
│   ├── HTTP Request: Login
│   ├── JSON Extractor: access_token
│   └── BeanShell: Save to Props
│
├── HTTP Header Manager (Global)
│   ├── Content-Type: application/json
│   └── Authorization: Bearer ${__P(AUTH_TOKEN)}
│
├── Thread Group: Load Test - Autenticación
│   ├── CSV Data Set Config: users.csv
│   ├── HTTP Request: Login
│   ├── HTTP Request: Get Me
│   └── HTTP Request: Refresh Token
│
├── Thread Group: Load Test - Atletas
│   ├── HTTP Request: Listar Atletas
│   ├── HTTP Request: Ver Historial Médico
│   └── Constant Timer: 2000ms
│
├── Thread Group: Load Test - Entrenamientos
│   ├── HTTP Request: Listar Entrenamientos
│   ├── HTTP Request: Crear Entrenamiento
│   ├── HTTP Request: Ver Detalle
│   └── Uniform Random Timer: 1000-3000ms
│
└── Listeners
    ├── View Results Tree
    ├── Summary Report
    ├── Aggregate Report
    ├── Response Time Graph
    └── Backend Listener (Prometheus/Grafana)
```

### 5.2 Backend Listener para Prometheus

**Configuración del Backend Listener:**

```
Backend Listener Implementation:
- org.apache.jmeter.visualizers.backend.graphite.GraphiteBackendListenerClient

Parameters:
- graphiteMetricsSender: org.apache.jmeter.visualizers.backend.graphite.TextGraphiteMetricsSender
- graphiteHost: localhost
- graphitePort: 2003
- rootMetricsPrefix: jmeter.
- summaryOnly: false
- samplersList: .*
- percentiles: 90;95;99
- testName: LoadTest_Atletas
```

**ALTERNATIVA: Plugin InfluxDB (Recomendado)**

1. Instalar plugin: `InfluxDB Backend Listener`
2. Configuración:

```
Backend Listener Implementation:
- org.apache.jmeter.visualizers.backend.influxdb.InfluxdbBackendListenerClient

Parameters:
- influxdbMetricsSender: org.apache.jmeter.visualizers.backend.influxdb.HttpMetricsSender
- influxdbUrl: http://localhost:8086/write?db=jmeter
- application: deportes-api
- measurement: jmeter
- summaryOnly: false
- samplersRegex: .*
- percentiles: 90;95;99
- testTitle: LoadTest
- eventTags: 
```

### 5.3 Ejemplo de Test Plan XML (fragmento)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="API Testing">
      <elementProp name="TestPlan.user_defined_variables" elementType="Arguments">
        <collectionProp name="Arguments.arguments">
          <elementProp name="HOST" elementType="Argument">
            <stringProp name="Argument.name">HOST</stringProp>
            <stringProp name="Argument.value">localhost</stringProp>
          </elementProp>
          <elementProp name="PORT" elementType="Argument">
            <stringProp name="Argument.name">PORT</stringProp>
            <stringProp name="Argument.value">8080</stringProp>
          </elementProp>
        </collectionProp>
      </elementProp>
    </TestPlan>
    
    <!-- Thread Group para Login -->
    <SetupThreadGroup guiclass="SetupThreadGroupGui" testclass="SetupThreadGroup" testname="Setup - Authentication">
      <stringProp name="ThreadGroup.num_threads">1</stringProp>
      <stringProp name="ThreadGroup.ramp_time">0</stringProp>
      <longProp name="ThreadGroup.start_time">1</longProp>
      <longProp name="ThreadGroup.end_time">1</longProp>
      <boolProp name="ThreadGroup.scheduler">false</boolProp>
      <stringProp name="ThreadGroup.duration"></stringProp>
      <stringProp name="ThreadGroup.delay"></stringProp>
    </SetupThreadGroup>
    
    <hashTree>
      <!-- HTTP Request: Login -->
      <HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="POST Login">
        <stringProp name="HTTPSampler.domain">${HOST}</stringProp>
        <stringProp name="HTTPSampler.port">${PORT}</stringProp>
        <stringProp name="HTTPSampler.protocol">http</stringProp>
        <stringProp name="HTTPSampler.path">/api/v1/auth/login</stringProp>
        <stringProp name="HTTPSampler.method">POST</stringProp>
        <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
        <stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp>
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
          <collectionProp name="Arguments.arguments">
            <elementProp name="" elementType="HTTPArgument">
              <boolProp name="HTTPArgument.always_encode">false</boolProp>
              <stringProp name="Argument.value">{&quot;email&quot;:&quot;admin@test.com&quot;,&quot;password&quot;:&quot;Admin123!&quot;}</stringProp>
              <stringProp name="Argument.metadata">=</stringProp>
            </elementProp>
          </collectionProp>
        </elementProp>
      </HTTPSamplerProxy>
      
      <hashTree>
        <!-- JSON Extractor -->
        <JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract Token">
          <stringProp name="JSONPostProcessor.referenceNames">access_token</stringProp>
          <stringProp name="JSONPostProcessor.jsonPathExprs">$.access_token</stringProp>
          <stringProp name="JSONPostProcessor.match_numbers">1</stringProp>
          <stringProp name="JSONPostProcessor.defaultValues">TOKEN_NOT_FOUND</stringProp>
        </JSONPostProcessor>
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
```

---

## 6. CONFIGURACIÓN DE GATLING

### 6.1 Estructura de Proyecto Gatling

```
gatling-project/
├── pom.xml
├── src/
│   ├── test/
│   │   ├── scala/
│   │   │   ├── simulations/
│   │   │   │   ├── AuthSimulation.scala
│   │   │   │   ├── LoadTestSimulation.scala
│   │   │   │   ├── StressTestSimulation.scala
│   │   │   │   └── VolumeTestSimulation.scala
│   │   │   └── utils/
│   │   │       ├── AuthScenario.scala
│   │   │       └── CommonConfig.scala
│   │   └── resources/
│   │       ├── data/
│   │       │   ├── users.csv
│   │       │   ├── atletas.csv
│   │       │   └── entrenamientos.csv
│   │       ├── gatling.conf
│   │       └── logback-test.xml
└── target/
```

### 6.2 Configuración de Gatling (gatling.conf)

```hocon
gatling {
  core {
    outputDirectoryBaseName = "deportes-api"
    runDescription = "Performance Testing - ISO 25010"
    encoding = "utf-8"
    
    directory {
      simulations = "simulations"
      resources = "src/test/resources"
      results = "target/gatling"
      binaries = ""
    }
  }
  
  charting {
    indicators {
      lowerBound = 800
      higherBound = 1200
      percentile1 = 50
      percentile2 = 75
      percentile3 = 95
      percentile4 = 99
    }
  }
  
  http {
    enableGA = false
    shareConnections = true
    
    ahc {
      keepAlive = true
      maxConnectionsPerHost = 6
    }
  }
  
  data {
    writers = [console, file, graphite]
    
    graphite {
      host = "localhost"
      port = 2003
      protocol = "tcp"
      rootPathPrefix = "gatling"
      bufferSize = 8192
      writeInterval = 1
    }
  }
}
```

### 6.3 Load Test Simulation Completo

**Archivo: `LoadTestSimulation.scala`**

```scala
package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class LoadTestSimulation extends Simulation {

  // Configuración HTTP
  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling/LoadTest")

  // Feeders
  val usersFeeder = csv("data/users.csv").circular
  val atletasFeeder = csv("data/atletas.csv").random

  // Escenario de Autenticación
  val authScenario = scenario("Auth Flow")
    .feed(usersFeeder)
    .exec(
      http("Login")
        .post("/api/v1/auth/login")
        .body(StringBody("""{"email":"${email}","password":"${password}"}"""))
        .check(status.is(200))
        .check(jsonPath("$.access_token").saveAs("token"))
    )
    .pause(1, 2)
    .exec(
      http("Get Profile")
        .get("/api/v1/auth/users/me")
        .header("Authorization", "Bearer ${token}")
        .check(status.is(200))
    )

  // Escenario de Atletas
  val atletasScenario = scenario("Atletas Operations")
    .feed(usersFeeder)
    .exec(
      http("Login")
        .post("/api/v1/auth/login")
        .body(StringBody("""{"email":"${email}","password":"${password}"}"""))
        .check(jsonPath("$.access_token").saveAs("token"))
    )
    .pause(1)
    .repeat(5) {
      exec(
        http("Listar Atletas")
          .get("/api/v1/atleta/")
          .header("Authorization", "Bearer ${token}")
          .check(status.is(200))
          .check(jsonPath("$[*].external_id").findAll.saveAs("atletaIds"))
      )
      .pause(2, 4)
      .exec(
        http("Ver Historial Médico")
          .get("/api/v1/atleta/historial-medico/me")
          .header("Authorization", "Bearer ${token}")
          .check(status.in(200, 404))
      )
      .pause(1, 3)
    }

  // Escenario de Entrenamientos
  val entrenamientosScenario = scenario("Entrenamientos Operations")
    .feed(usersFeeder)
    .exec(
      http("Login")
        .post("/api/v1/auth/login")
        .body(StringBody("""{"email":"${email}","password":"${password}"}"""))
        .check(jsonPath("$.access_token").saveAs("token"))
    )
    .pause(1)
    .exec(
      http("Listar Entrenamientos")
        .get("/api/v1/entrenador/entrenamientos/")
        .header("Authorization", "Bearer ${token}")
        .check(status.is(200))
    )
    .pause(2)
    .exec(
      http("Crear Entrenamiento")
        .post("/api/v1/entrenador/entrenamientos/")
        .header("Authorization", "Bearer ${token}")
        .body(StringBody("""{
          "nombre": "Entrenamiento Test ${__UUID()}",
          "descripcion": "Descripción de prueba",
          "fecha": "2026-02-15"
        }"""))
        .check(status.in(200, 201))
    )

  // Setup de inyección de usuarios
  setUp(
    authScenario.inject(
      nothingFor(5.seconds),
      rampUsers(20) during(30.seconds),
      constantUsersPerSec(5) during(120.seconds)
    ).protocols(httpProtocol),
    
    atletasScenario.inject(
      nothingFor(10.seconds),
      rampUsers(30) during(45.seconds),
      constantUsersPerSec(3) during(120.seconds)
    ).protocols(httpProtocol),
    
    entrenamientosScenario.inject(
      nothingFor(15.seconds),
      rampUsers(20) during(30.seconds),
      constantUsersPerSec(2) during(120.seconds)
    ).protocols(httpProtocol)
  ).assertions(
    global.responseTime.max.lt(5000),
    global.responseTime.percentile3.lt(2000),
    global.successfulRequests.percent.gt(95),
    forAll.failedRequests.percent.lt(5)
  )
}
```

### 6.4 Stress Test Simulation

**Archivo: `StressTestSimulation.scala`**

```scala
package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class StressTestSimulation extends Simulation {

  val httpProtocol = http
    .baseUrl("http://localhost:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  val usersFeeder = csv("data/users.csv").circular

  val stressScenario = scenario("Stress Test - Login")
    .feed(usersFeeder)
    .exec(
      http("Login Under Stress")
        .post("/api/v1/auth/login")
        .body(StringBody("""{"email":"${email}","password":"${password}"}"""))
        .check(status.in(200, 429, 500, 503))
    )

  setUp(
    stressScenario.inject(
      // Fase 1: Calentamiento
      rampUsers(50) during(30.seconds),
      
      // Fase 2: Carga normal
      constantUsersPerSec(10) during(60.seconds),
      
      // Fase 3: Incremento gradual
      rampUsersPerSec(10) to(50) during(120.seconds),
      
      // Fase 4: Carga sostenida alta
      constantUsersPerSec(50) during(60.seconds),
      
      // Fase 5: Pico extremo
      rampUsersPerSec(50) to(200) during(60.seconds),
      
      // Fase 6: Pico máximo
      constantUsersPerSec(200) during(30.seconds),
      
      // Fase 7: Descenso
      rampUsersPerSec(200) to(10) during(60.seconds)
    )
  ).protocols(httpProtocol)
   .maxDuration(10.minutes)
   .assertions(
     global.responseTime.max.lt(10000),
     global.failedRequests.percent.lt(10)
   )
}
```

---

## 7. DASHBOARDS DE GRAFANA

### 7.1 Dashboard Principal - Vista General

**Archivo: `grafana/dashboards/main-dashboard.json`**

Paneles principales:

#### Panel 1: Métricas Generales del Sistema
```json
{
  "title": "System Overview",
  "panels": [
    {
      "title": "Request Rate (req/s)",
      "targets": [
        {
          "expr": "rate(http_server_requests_seconds_count[1m])"
        }
      ]
    },
    {
      "title": "Average Response Time",
      "targets": [
        {
          "expr": "rate(http_server_requests_seconds_sum[1m]) / rate(http_server_requests_seconds_count[1m])"
        }
      ]
    },
    {
      "title": "Error Rate (%)",
      "targets": [
        {
          "expr": "100 * (sum(rate(http_server_requests_seconds_count{status=~\"5..\"}[1m])) / sum(rate(http_server_requests_seconds_count[1m])))"
        }
      ]
    }
  ]
}
```

### 7.2 Queries Prometheus Clave para Grafana

#### **Tiempo de Respuesta por Endpoint**
```promql
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket{uri!~"/actuator.*"}[5m])) by (uri, le)
) * 1000
```

#### **Throughput (Requests por segundo)**
```promql
sum(rate(http_server_requests_seconds_count[1m])) by (uri)
```

#### **Tasa de Error por Endpoint**
```promql
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) by (uri) / 
sum(rate(http_server_requests_seconds_count[5m])) by (uri) * 100
```

#### **CPU Usage - Backend**
```promql
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

#### **Memory Usage - Backend**
```promql
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
```

#### **Database Connections**
```promql
mysql_global_status_threads_connected
```

#### **Slow Queries (> 1s)**
```promql
histogram_quantile(0.99, 
  sum(rate(http_server_requests_seconds_bucket[5m])) by (uri, le)
) > 1
```

#### **Request Duration Percentiles**
```promql
# P50
histogram_quantile(0.50, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# P95
histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# P99
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))
```

### 7.3 Dashboard Específico - Autenticación

**Paneles:**

1. **Login Success Rate**
```promql
sum(rate(http_server_requests_seconds_count{uri="/api/v1/auth/login", status="200"}[5m])) / 
sum(rate(http_server_requests_seconds_count{uri="/api/v1/auth/login"}[5m])) * 100
```

2. **Failed Login Attempts**
```promql
sum(rate(http_server_requests_seconds_count{uri="/api/v1/auth/login", status=~"4.."}[5m]))
```

3. **Token Refresh Rate**
```promql
rate(http_server_requests_seconds_count{uri="/api/v1/auth/refresh"}[5m])
```

### 7.4 Dashboard Específico - Base de Datos

**Paneles:**

1. **Query Execution Time**
```promql
mysql_global_status_queries / mysql_global_status_uptime
```

2. **Connection Pool Usage**
```promql
hikaricp_connections_active{pool="HikariPool-1"}
```

3. **Slow Query Count**
```promql
mysql_global_status_slow_queries
```

4. **InnoDB Buffer Pool Hit Rate**
```promql
(mysql_global_status_innodb_buffer_pool_read_requests - mysql_global_status_innodb_buffer_pool_reads) / 
mysql_global_status_innodb_buffer_pool_read_requests * 100
```

### 7.5 Alertas Configuradas en Grafana

**Alert 1: High Response Time**
```yaml
Condition: avg() of query(A, 5m, now) IS ABOVE 3000
Message: "Response time exceeded 3 seconds on ${uri}"
```

**Alert 2: High Error Rate**
```yaml
Condition: avg() of query(B, 5m, now) IS ABOVE 5
Message: "Error rate exceeded 5% on ${uri}"
```

**Alert 3: High CPU Usage**
```yaml
Condition: avg() of query(C, 5m, now) IS ABOVE 85
Message: "CPU usage exceeded 85% on backend"
```

**Alert 4: Database Connection Pool Exhaustion**
```yaml
Condition: current() of query(D, now, now) IS ABOVE 95
Message: "Database connection pool usage above 95%"
```

---

## 8. MÉTRICAS A MONITOREAR

### 8.1 Métricas de Aplicación (Spring Boot)

| Métrica | Query Prometheus | Umbral Aceptable | Umbral Crítico |
|---------|------------------|------------------|----------------|
| **Tiempo de respuesta P95** | `histogram_quantile(0.95, ...)` | < 2s | > 5s |
| **Tiempo de respuesta P99** | `histogram_quantile(0.99, ...)` | < 3s | > 8s |
| **Throughput** | `rate(http_server_requests_seconds_count[1m])` | > 100 req/s | < 50 req/s |
| **Tasa de error** | `sum(rate(...{status=~"5.."})) / sum(rate(...))` | < 1% | > 5% |
| **Latencia promedio** | `rate(..._sum[1m]) / rate(..._count[1m])` | < 500ms | > 2s |

### 8.2 Métricas de Infraestructura

| Métrica | Query Prometheus | Umbral Aceptable | Umbral Crítico |
|---------|------------------|------------------|----------------|
| **CPU Backend** | `100 - (avg(...{mode="idle"}[5m]) * 100)` | < 70% | > 90% |
| **Memoria Backend** | `(MemTotal - MemAvailable) / MemTotal * 100` | < 75% | > 90% |
| **CPU Database** | Similar al backend | < 60% | > 85% |
| **Memoria Database** | Similar al backend | < 70% | > 85% |
| **Disk I/O** | `rate(node_disk_io_time_seconds_total[5m])` | < 60% | > 80% |

### 8.3 Métricas de Base de Datos (MariaDB)

| Métrica | Query Prometheus | Umbral Aceptable | Umbral Crítico |
|---------|------------------|------------------|----------------|
| **Conexiones activas** | `mysql_global_status_threads_connected` | < 80 | > 150 |
| **Queries por segundo** | `rate(mysql_global_status_queries[1m])` | 100-500 | > 1000 |
| **Slow queries** | `mysql_global_status_slow_queries` | < 10/min | > 50/min |
| **InnoDB buffer hit rate** | Fórmula arriba | > 95% | < 85% |
| **Lock wait time** | `mysql_global_status_innodb_row_lock_time` | < 100ms | > 500ms |

### 8.4 Métricas Específicas por Endpoint

**Endpoints a monitorear prioritariamente:**

```
/api/v1/auth/login
/api/v1/auth/register
/api/v1/atleta/ (GET)
/api/v1/entrenador/entrenamientos/ (GET)
/api/v1/competencia/competencias (GET)
```

**Para cada endpoint:**
- Tiempo de respuesta (P50, P95, P99)
- Tasa de error
- Throughput
- Latencia de DB

---

## 9. INTERPRETACIÓN DE RESULTADOS

### 9.1 Cómo Identificar Problemas en Grafana

#### **Problema 1: Tiempos de Respuesta Altos**

**Síntomas en Grafana:**
- Panel de "Response Time" muestra picos > 5s
- P95 y P99 están muy separados del promedio
- El gráfico muestra tendencia ascendente

**Posibles causas:**
1. **Queries N+1 en la base de datos**
   - Ver panel "DB Query Count"
   - Si hay muchas queries por request → optimizar con JOIN o eager loading

2. **Falta de índices**
   - Ver panel "Slow Queries"
   - Ejecutar `EXPLAIN` en queries lentas

3. **Falta de paginación**
   - Ver panel "Response Size"
   - Si el tamaño de respuesta es > 1MB → implementar paginación

**Cómo verificar en Grafana:**
```
1. Dashboard "Database" → Panel "Query Execution Time"
2. Buscar correlación entre:
   - Alto response time
   - Alto número de queries
   - Alto CPU de DB
```

#### **Problema 2: Tasa de Error Alta**

**Síntomas en Grafana:**
- Panel "Error Rate" > 5%
- Panel "HTTP Status Codes" muestra muchos 500/503
- Logs muestran excepciones

**Posibles causas:**
1. **Timeout de conexión a DB**
   - Ver panel "DB Connection Pool"
   - Si conexiones activas ≈ max pool size → aumentar pool

2. **Memory leaks**
   - Ver panel "Memory Usage"
   - Si memoria crece constantemente → heap dump analysis

3. **Race conditions**
   - Ver panel "Concurrent Requests"
   - Si errores coinciden con alta concurrencia → revisar locks

**Cómo verificar en Grafana:**
```
1. Dashboard "Main" → Panel "Error Rate by Endpoint"
2. Identificar endpoint con más errores
3. Dashboard "Database" → Panel "Connection Pool"
4. Ver si hay correlación con pool exhaustion
```

#### **Problema 3: CPU al 100%**

**Síntomas en Grafana:**
- Panel "CPU Usage Backend" sostenido en 90-100%
- Response time incrementa proporcionalmente
- Throughput se estanca

**Posibles causas:**
1. **Operaciones computacionalmente intensivas**
   - Ver panel "Endpoint Response Time"
   - Identificar cuáles consumen más CPU

2. **Garbage Collection excesivo**
   - Ver panel "JVM Memory"
   - Si GC frequency es alta → ajustar heap

3. **Queries GET sin optimizar**
   - Basado en tu análisis previo
   - Ver panel "Requests by Method"
   - Si GET consume más CPU que POST → optimizar queries

**Cómo verificar en Grafana:**
```
1. Dashboard "System" → Panel "CPU by Service"
2. Ver cuál servicio consume más (backend/db)
3. Si es backend:
   - Dashboard "Application" → Panel "Slow Endpoints"
   - Optimizar código del endpoint lento
4. Si es DB:
   - Dashboard "Database" → Panel "Query Analysis"
   - Optimizar queries
```

### 9.2 Matriz de Diagnóstico

| Síntoma | Causa Probable | Panel de Grafana | Acción |
|---------|----------------|------------------|--------|
| Response time > 5s | Query lenta | "DB Query Time" | Añadir índice |
| Error rate > 5% | Pool exhausted | "DB Connections" | Aumentar pool size |
| CPU Backend > 90% | GET no optimizado | "CPU by Endpoint" | Implementar caché |
| CPU DB > 85% | Full table scan | "Slow Queries" | Añadir índice |
| Memory creciente | Memory leak | "JVM Heap" | Heap dump analysis |
| Throughput bajo | Thread pool pequeño | "Active Threads" | Aumentar threads |
| Latencia variable | No hay paginación | "Response Size" | Implementar paginación |

### 9.3 Comparación: Load vs Stress vs Volume

**En Grafana, crear un dashboard comparativo:**

| Métrica | Load (50 users) | Stress (1000 users) | Volume (5000 records) |
|---------|-----------------|---------------------|----------------------|
| Avg Response Time | 500ms | 3500ms | 8000ms |
| P95 Response Time | 1200ms | 8000ms | 15000ms |
| Error Rate | 0.5% | 8% | 12% |
| CPU Backend | 45% | 95% | 70% |
| CPU DB | 30% | 85% | 90% |
| Throughput | 120 req/s | 80 req/s | 15 req/s |

**Interpretación:**
- **Load Test**: Sistema funciona bien ✅
- **Stress Test**: Punto de ruptura en 1000 usuarios ⚠️
- **Volume Test**: DB no optimizada para grandes volúmenes ❌

---

## 10. PLAN DE EJECUCIÓN TIMELINE

### Semana 1: Preparación

#### Día 1-2: Setup de Infraestructura
- [ ] Instalar Docker
- [ ] Configurar `docker-compose.monitoring.yml`
- [ ] Levantar stack: `docker-compose up -d`
- [ ] Verificar Prometheus: `http://localhost:9090`
- [ ] Verificar Grafana: `http://localhost:3000`

#### Día 3-4: Configuración de Aplicación
- [ ] Añadir dependencias de Actuator y Micrometer a Spring Boot
- [ ] Configurar `application-monitoring.yml`
- [ ] Reiniciar backend con perfil monitoring
- [ ] Verificar métricas: `http://localhost:8080/actuator/prometheus`
- [ ] Verificar que Prometheus recolecta métricas

#### Día 5: Configuración de Grafana
- [ ] Crear datasource de Prometheus en Grafana
- [ ] Importar dashboards base
- [ ] Configurar alertas básicas
- [ ] Crear usuarios de Grafana

### Semana 2: Configuración de Herramientas de Prueba

#### Día 1-2: JMeter
- [ ] Instalar JMeter
- [ ] Crear Test Plan base
- [ ] Configurar Setup Thread Group para login
- [ ] Probar autenticación con 1 usuario
- [ ] Configurar CSV con usuarios de prueba
- [ ] Configurar Backend Listener

#### Día 3-4: Gatling
- [ ] Configurar proyecto Maven/SBT
- [ ] Crear `AuthScenario.scala`
- [ ] Crear `LoadTestSimulation.scala`
- [ ] Probar simulación con 10 usuarios
- [ ] Configurar Graphite exporter

#### Día 5: Preparación de Datos
- [ ] Crear script SQL para poblar DB
- [ ] Generar 5000 registros de atletas
- [ ] Generar 10000 entrenamientos
- [ ] Crear archivos CSV para feeders
- [ ] Backup de base de datos

### Semana 3: Ejecución de Pruebas

#### Día 1: Load Testing - Fase 1
**Mañana:**
- [ ] Ejecutar Load Test con 50 usuarios (JMeter)
- [ ] Monitorear en Grafana en tiempo real
- [ ] Capturar screenshots de dashboards
- [ ] Exportar métricas de Prometheus

**Tarde:**
- [ ] Ejecutar Load Test con 50 usuarios (Gatling)
- [ ] Comparar resultados JMeter vs Gatling
- [ ] Documentar hallazgos iniciales

#### Día 2: Load Testing - Fase 2
**Mañana:**
- [ ] Ejecutar Load Test con 100 usuarios (JMeter)
- [ ] Identificar degradación de performance
- [ ] Capturar logs del backend

**Tarde:**
- [ ] Ejecutar Load Test con 100 usuarios (Gatling)
- [ ] Analizar métricas de CPU y memoria
- [ ] Generar reporte preliminar

#### Día 3: Stress Testing
**Mañana:**
- [ ] Ejecutar Stress Test incremental (JMeter)
  - 50, 100, 200, 400, 800, 1000+ usuarios
- [ ] Monitorear punto de ruptura
- [ ] Documentar en qué punto falla

**Tarde:**
- [ ] Ejecutar Stress Test incremental (Gatling)
- [ ] Ejecutar Spike Test (0→500→0 usuarios)
- [ ] Verificar recuperación del sistema

#### Día 4: Volume Testing
**Mañana:**
- [ ] Poblar DB con 5000+ registros
- [ ] Ejecutar consultas GET sin paginación
- [ ] Medir tiempos de respuesta

**Tarde:**
- [ ] Implementar paginación en endpoints críticos
- [ ] Re-ejecutar pruebas con paginación
- [ ] Comparar before/after

#### Día 5: Pruebas Específicas
- [ ] Probar endpoints de autenticación específicamente
- [ ] Probar endpoints de competencias
- [ ] Probar endpoints de asistencias
- [ ] Pruebas de recuperación (kill backend → restart)

### Semana 4: Análisis y Documentación

#### Día 1-2: Análisis de Resultados
- [ ] Revisar todos los dashboards de Grafana
- [ ] Exportar queries de Prometheus relevantes
- [ ] Identificar patrones en los gráficos
- [ ] Crear matriz de diagnóstico con hallazgos

#### Día 3: Optimizaciones
- [ ] Implementar índices en DB según hallazgos
- [ ] Optimizar queries N+1 identificadas
- [ ] Implementar caché para endpoints lentos
- [ ] Ajustar pool de conexiones

#### Día 4: Re-Testing
- [ ] Re-ejecutar Load Test con optimizaciones
- [ ] Re-ejecutar Stress Test
- [ ] Comparar métricas before/after
- [ ] Documentar mejoras obtenidas

#### Día 5: Documentación Final
- [ ] Crear informe ejecutivo
- [ ] Documentar configuración de Grafana
- [ ] Crear guía de troubleshooting
- [ ] Presentación de resultados

---

## 11. SCRIPTS ÚTILES

### 11.1 Script para Generar Usuarios de Prueba

**Archivo: `scripts/generate-test-users.sh`**

```bash
#!/bin/bash

# Generar 100 usuarios de prueba
echo "email,password" > users.csv

for i in {1..100}; do
  echo "user${i}@test.com,Password123!" >> users.csv
done

echo "admin@test.com,Admin123!" >> users.csv
echo "entrenador@test.com,Password123!" >> users.csv
echo "atleta@test.com,Password123!" >> users.csv
echo "representante@test.com,Password123!" >> users.csv

echo "✅ Archivo users.csv creado con 104 usuarios"
```

### 11.2 Script para Poblar Base de Datos

**Archivo: `scripts/populate-db.sql`**

```sql
-- Script para poblar base de datos con datos de prueba

-- 1. Generar 5000 atletas
DELIMITER //
CREATE PROCEDURE generate_atletas()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 5000 DO
    INSERT INTO atletas (nombre, email, edad, external_id, created_at)
    VALUES (
      CONCAT('Atleta ', i),
      CONCAT('atleta', i, '@test.com'),
      FLOOR(15 + RAND() * 20),
      UUID(),
      NOW()
    );
    SET i = i + 1;
  END WHILE;
END//
DELIMITER ;

CALL generate_atletas();

-- 2. Generar 10000 entrenamientos
DELIMITER //
CREATE PROCEDURE generate_entrenamientos()
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= 10000 DO
    INSERT INTO entrenamientos (nombre, descripcion, fecha, external_id, created_at)
    VALUES (
      CONCAT('Entrenamiento ', i),
      CONCAT('Descripción del entrenamiento ', i),
      DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 365) DAY),
      UUID(),
      NOW()
    );
    SET i = i + 1;
  END WHILE;
END//
DELIMITER ;

CALL generate_entrenamientos();

-- 3. Generar competencias
INSERT INTO competencias (nombre, fecha, lugar, external_id, created_at)
SELECT 
  CONCAT('Competencia ', n),
  DATE_ADD('2024-06-01', INTERVAL FLOOR(RAND() * 180) DAY),
  CONCAT('Lugar ', n),
  UUID(),
  NOW()
FROM (
  SELECT @row := @row + 1 AS n
  FROM information_schema.tables t1, 
       information_schema.tables t2,
       (SELECT @row := 0) r
  LIMIT 1000
) numbers;

-- Verificar datos generados
SELECT 
  'atletas' as tabla, COUNT(*) as total FROM atletas
UNION ALL
SELECT 'entrenamientos', COUNT(*) FROM entrenamientos
UNION ALL
SELECT 'competencias', COUNT(*) FROM competencias;
```

### 11.3 Script para Limpiar Datos de Prueba

**Archivo: `scripts/cleanup-test-data.sql`**

```sql
-- Limpiar datos de prueba (¡CUIDADO en producción!)

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE atletas;
TRUNCATE TABLE entrenamientos;
TRUNCATE TABLE competencias;
TRUNCATE TABLE asistencias;
TRUNCATE TABLE resultados;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Datos de prueba eliminados' as status;
```

### 11.4 Script para Monitoreo en Tiempo Real

**Archivo: `scripts/monitor-resources.sh`**

```bash
#!/bin/bash

# Monitorear recursos durante las pruebas

echo "Monitoreando recursos del sistema..."
echo "Presiona Ctrl+C para detener"
echo ""

while true; do
  clear
  echo "=== MONITOREO DE RECURSOS ==="
  echo "$(date)"
  echo ""
  
  echo "--- Contenedores Docker ---"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
  
  echo ""
  echo "--- Conexiones a MariaDB ---"
  docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Threads_connected';"
  
  echo ""
  echo "--- Queries Lentas ---"
  docker exec mariadb mysql -uroot -prootpass -e "SHOW STATUS LIKE 'Slow_queries';"
  
  sleep 5
done
```

### 11.5 Script para Exportar Métricas de Grafana

**Archivo: `scripts/export-grafana-metrics.sh`**

```bash
#!/bin/bash

# Exportar dashboards de Grafana como JSON

GRAFANA_URL="http://localhost:3000"
GRAFANA_USER="admin"
GRAFANA_PASS="admin123"
OUTPUT_DIR="./grafana-exports"

mkdir -p $OUTPUT_DIR

# Obtener lista de dashboards
DASHBOARDS=$(curl -s -u $GRAFANA_USER:$GRAFANA_PASS \
  $GRAFANA_URL/api/search?type=dash-db | jq -r '.[] | .uid')

# Exportar cada dashboard
for uid in $DASHBOARDS; do
  echo "Exportando dashboard: $uid"
  curl -s -u $GRAFANA_USER:$GRAFANA_PASS \
    $GRAFANA_URL/api/dashboards/uid/$uid | \
    jq '.dashboard' > $OUTPUT_DIR/$uid.json
done

echo "✅ Dashboards exportados a $OUTPUT_DIR"
```

---

## 12. CHECKLIST FINAL

### Pre-Pruebas
- [ ] Prometheus recolectando métricas correctamente
- [ ] Grafana con datasource configurado
- [ ] Dashboards importados y funcionales
- [ ] Alertas configuradas
- [ ] Backend con Actuator habilitado
- [ ] Base de datos poblada con datos de prueba
- [ ] JMeter configurado con autenticación
- [ ] Gatling configurado con autenticación
- [ ] CSV de usuarios creado
- [ ] Backup de base de datos realizado

### Durante las Pruebas
- [ ] Monitorear Grafana en tiempo real
- [ ] Capturar screenshots de métricas clave
- [ ] Documentar comportamientos anómalos
- [ ] Guardar logs del backend
- [ ] Exportar datos de Prometheus
- [ ] Verificar que no hay errores de red/timeout

### Post-Pruebas
- [ ] Exportar reportes de JMeter
- [ ] Exportar reportes de Gatling
- [ ] Exportar dashboards de Grafana
- [ ] Analizar logs del backend
- [ ] Crear matriz de diagnóstico
- [ ] Documentar optimizaciones necesarias
- [ ] Restaurar base de datos si es necesario

---

## 13. RECURSOS ADICIONALES

### Documentación Oficial
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **JMeter**: https://jmeter.apache.org/usermanual/
- **Gatling**: https://gatling.io/docs/
- **Spring Boot Actuator**: https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html
- **Micrometer**: https://micrometer.io/docs

### Dashboards de Grafana Preconstruidos
- **Spring Boot Dashboard**: ID 4701
- **MySQL Dashboard**: ID 7362
- **JVM Micrometer**: ID 4701
- **Node Exporter Full**: ID 1860

### Queries PromQL Útiles
- **PromQL Cheat Sheet**: https://promlabs.com/promql-cheat-sheet/
- **Ejemplos de queries**: https://prometheus.io/docs/prometheus/latest/querying/examples/

---

## CONCLUSIÓN

Este plan proporciona una guía completa y detallada para:

✅ **Configurar** un stack de monitoreo profesional con Prometheus + Grafana  
✅ **Resolver** el problema de autenticación en rutas protegidas  
✅ **Ejecutar** pruebas de Load, Stress y Volume de forma sistemática  
✅ **Analizar** resultados en tiempo real con dashboards visuales  
✅ **Identificar** cuellos de botella y puntos de falla  
✅ **Documentar** hallazgos de forma profesional según ISO 25010  

**Tiempo estimado total**: 4 semanas  
**Nivel de dificultad**: Intermedio-Avanzado  
**Requisitos**: Conocimientos de Docker, SQL, Spring Boot, y herramientas de testing  

¡Éxito con las pruebas! 🚀
