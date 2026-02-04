# 🔄 Flujo del Pipeline CI/CD - Jenkins

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         INICIO DEL PIPELINE                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. CHECKOUT & SETUP                                              │
│  • Clonar repositorio                                             │
│  • Configurar variables                                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. TESTS UNITARIOS - BACKEND                                     │
│  • pytest -c ./tests/pytest.ini                                   │
│  • Genera coverage.xml y test-results.xml                         │
│  • Publica reportes HTML                                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. TESTS UNITARIOS - FRONTEND                                    │
│  • npm run test -- --run --reporter=verbose                       │
│  • Genera reportes de coverage                                    │
│  • Publica reportes HTML                                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. ANÁLISIS SONARQUBE (AUTOMÁTICO)                               │
│  • Inicia SonarQube si no está corriendo                          │
│  • Espera a que esté listo                                        │
│  • Ejecuta análisis de código                                     │
│  • Verifica Quality Gate                                          │
│  • ⚠️ No bloquea el pipeline                                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. PRUEBAS DE INTEGRACIÓN                                        │
│  • pytest -c ci/integration_test/pytest.ini                       │
│  • Tests end-to-end                                               │
│  • Publica reportes                                               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. BUILD IMÁGENES - DEVELOPMENT                                  │
│  • Backend: ENV=development                                       │
│  • Frontend: ENV=development                                      │
│  • Tags: :dev, :dev-{build-number}                                │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. DEPLOY DEV & PRUEBAS DE CARGA/ESTRÉS (AUTOMÁTICO)            │
│  • docker-compose up -d                                           │
│  • Espera servicios (30s)                                         │
│  • Health checks                                                  │
│  • Pobla base de datos de prueba                                  │
│  • Ejecuta pruebas de carga con Locust                            │
│  • Ejecuta pruebas de estrés                                      │
│  • Genera reportes HTML                                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │  ¿Pasaron las pruebas?  │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │ NO                          │ SÍ
                 ▼                             ▼
    ┌────────────────────────┐    ┌──────────────────────────────┐
    │  ❌ PIPELINE FALLA     │    │  ✅ CONTINÚA                  │
    │  • No se crea prod     │    │  • Limpia entorno dev         │
    │  • No se hace deploy   │    │  • Elimina imágenes dev       │
    └────────────────────────┘    └──────────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────┐
                        │  8. BUILD IMÁGENES - PRODUCTION      │
                        │  • Backend: ENV=production           │
                        │  • Frontend: ENV=production          │
                        │  • Tags: :latest, :{build-number}    │
                        │  • Build con --no-cache              │
                        └──────────────────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────┐
                        │  9. PUSH A DOCKER REGISTRY           │
                        │  • Solo en main/master/develop       │
                        │  • Push backend:latest y :tag        │
                        │  • Push frontend:latest y :tag       │
                        └──────────────────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────┐
                        │  10. DEPLOY A PRODUCCIÓN (MANUAL)    │
                        │  • Solo en main/master               │
                        │  • ⏸️  Requiere confirmación         │
                        │  • docker-compose.prod.yml           │
                        │  • Health checks                     │
                        └──────────────────────────────────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────┐
                        │  ✅ PIPELINE COMPLETADO              │
                        │  • Limpieza de recursos              │
                        │  • Notificaciones                    │
                        │  • Reportes finales                  │
                        └──────────────────────────────────────┘
```

## 🎯 Criterios de Decisión

### Paso 7: Pruebas de Carga/Estrés

**Variables evaluadas:**
- Response time < 1000ms (promedio)
- Error rate < 1%
- Throughput mínimo: 100 req/s
- CPU < 80%
- Memory < 85%

**Si PASA:**
- `STRESS_TESTS_PASSED = true`
- Continúa a build de producción

**Si FALLA:**
- `STRESS_TESTS_PASSED = false`
- Pipeline se detiene
- No se construyen imágenes de producción
- No se hace deploy

### Paso 9: Push a Registry

**Condiciones:**
```groovy
when {
    allOf {
        expression { env.STRESS_TESTS_PASSED == 'true' }
        anyOf {
            branch 'main'
            branch 'master'
            branch 'develop'
        }
    }
}
```

### Paso 10: Deploy a Producción

**Condiciones:**
```groovy
when {
    allOf {
        expression { env.STRESS_TESTS_PASSED == 'true' }
        anyOf {
            branch 'main'
            branch 'master'
        }
    }
}
```

**Requiere:** Confirmación manual del operador

## 📋 Comandos Ejecutados en Cada Etapa

### Backend Unit Tests
```bash
cd athletics_fastapi
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
pytest -c ./tests/pytest.ini --verbose
```

**Archivos generados:**
- `coverage.xml`
- `test-results.xml`
- `htmlcov/index.html`

### Frontend Unit Tests
```bash
cd athletics_vite_ui
npm ci
npm run test -- --run --reporter=verbose
```

**Archivos generados:**
- `coverage/index.html`

### Deploy & Stress Tests
```bash
# Inicia SonarQube
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml up -d

# Espera a que esté listo
until curl -s http://localhost:9000/api/system/status | grep -q "UP"

# Ejecuta análisis
docker run --rm --network host \
  -v "$(pwd)/../..:/usr/src" \
  sonarsource/sonar-scanner-cli:latest \
  -Dsonar.host.url=http://localhost:9000 \
  -Dproject.settings=ci/sonarqube/sonar-project.properties
```

### Integration Tests
```bash
cd ci/integration_test
python3 -m venv venv
. venv/bin/activate
pip install -r ../../athletics_fastapi/requirements.txt
pytest -c pytest.ini --verbose
```

**Archivos generados:**
- `integration-coverage.xml`
- `integration-test-results.xml`

### Stress Tests
```bash
cd ci/stress_tests
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
python populate_database.py
python run_all_tests.py --load
```

**Archivos generados:**
- `results/*.html`
- `results/*.csv`

## 🔐 Variables de Entorno

### Variables del Pipeline

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
    
    BACKEND_IMAGE = 'athletics-fastapi'
    FRONTEND_IMAGE = 'athletics-vite-ui'
    
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    LATEST_TAG = 'latest'
    
    BACKEND_PORT = '8080'
    WORKERS = '4'
    
    SONAR_HOST_URL = 'http://localhost:9000'
    SONAR_LOGIN = 'admin'
    SONAR_PASSWORD = 'admin'
    
    STRESS_TESTS_PASSED = 'false'
}
```

### Build Args - Development

```bash
--build-arg APPLICATION_PORT=8080
--build-arg WORKERS=4
--build-arg ENV=development
--build-arg VITE_API_URL=http://localhost:8080
--build-arg NODE_ENV=development
```

### Build Args - Production

```bash
--build-arg APPLICATION_PORT=8080
--build-arg WORKERS=4
--build-arg ENV=production
--build-arg VITE_API_URL=https://api.yourdomain.com
--build-arg NODE_ENV=production
```

## ⏱️ Tiempos Estimados

| Etapa | Tiempo Estimado |
|-------|-----------------|
| Checkout & Setup | 30 segundos |
| Backend Unit Tests | 2-5 minutos |
| Frontend Unit Tests | 1-3 minutos |
| SonarQube Analysis | 3-5 minutos |
| Integration Tests | 3-7 minutos |
| Build Dev Images | 5-10 minutos |
| Deploy & Stress Tests | 15-30 minutos |
| Build Prod Images | 5-10 minutos |
| Push Images | 2-5 minutos |
| Deploy Production | 3-5 minutos |
| **TOTAL** | **40-80 minutos** |

## 📊 Reportes Generados

### JUnit Reports
- Backend Unit Tests
- Frontend Unit Tests (si disponible)
- Integration Tests

### HTML Reports
- Backend Coverage
- Frontend Coverage
- Integration Tests Coverage
- Stress Tests Results

### SonarQube Dashboard
- Code Quality
- Security Hotspots
- Code Smells
- Duplications
- Coverage

## 🔔 Notificaciones

El pipeline puede configurarse para enviar notificaciones en:

### Success (post success)
```groovy
// Slack, Email, MS Teams, etc.
slackSend(
    color: 'good',
    message: "Pipeline Successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
)
```

### Failure (post failure)
```groovy
// Slack, Email, MS Teams, etc.
slackSend(
    color: 'danger',
    message: "Pipeline Failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
)
```

## 🛠️ Troubleshooting

### Error: "SonarQube no inicia"
- Verificar puerto 9000 disponible
- Verificar Docker tiene suficientes recursos
- Aumentar timeout en el script

### Error: "Stress tests fallan"
- Verificar que servicios estén corriendo
- Revisar logs: `docker-compose logs -f`
- Verificar configuración de base de datos
- Ajustar thresholds de performance

### Error: "Build production no se ejecuta"
- Verificar que `STRESS_TESTS_PASSED = true`
- Revisar logs de pruebas de estrés
- Verificar criterios de aceptación

## 📈 Mejoras Futuras

- [ ] Integración con Slack/Teams
- [ ] Deploy automático a Kubernetes
- [ ] Rollback automático en caso de fallo
- [ ] Smoke tests post-deploy
- [ ] Performance regression testing
- [ ] A/B testing automatizado
