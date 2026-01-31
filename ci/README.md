# 🔍 Integración Continua (CI) - Calidad y Rendimiento

Este directorio contiene la configuración para:
- **Análisis de Calidad de Código** con SonarQube
- **Pruebas de Estrés y Rendimiento** según ISO 25010

## 📁 Estructura del Directorio

```
ci/
├── README.md                      # Este archivo
├── ESTRUCTURA.md                  # Documentación de estructura
│
├── sonarqube/                     # Análisis de Calidad de Código
│   ├── docker-compose-sonarqube.yml   # Docker Compose de SonarQube
│   ├── sonar-project.properties       # Configuración multi-módulo
│   └── .env.sonar                     # Variables de entorno
│
└── stress_tests/                  # Pruebas de Estrés (ISO 25010)
    ├── docker-compose-stress.yml      # Docker Compose para pruebas
    ├── README.md                      # Documentación completa
    ├── jmeter/                        # Configuración de JMeter
    ├── gatling/                       # Configuración de Gatling
    └── prometheus/                    # Monitoreo de métricas
```

---

# 🔍 Análisis de Calidad de Código (SonarQube)


## 🚀 Inicio Rápido

### Levantar SonarQube

```bash
# Desde el directorio ci/sonarqube/
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml up -d
```

Esto levantará:
- **PostgreSQL** (base de datos de SonarQube)
- **SonarQube Server** en http://localhost:9000
- **SonarQube Scanner** (ejecutará el análisis automáticamente)

### Solo Levantar SonarQube Server (sin análisis)

```bash
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml up -d sonarqube-db sonarqube
```

## 🔐 Acceder a SonarQube

1. Abre tu navegador en: http://localhost:9000
2. Credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin`
3. SonarQube te pedirá cambiar la contraseña en el primer inicio

## 📊 Ver Resultados del Análisis

Una vez que el scanner termine (puede tomar varios minutos), verás:
- **Proyecto Principal**: `athletics-sports-module`
- **Módulo Backend**: `athletics-fastapi`
- **Módulo Frontend**: `athletics-vite_ui`

## 🔄 Ejecutar Análisis Manual

Si quieres ejecutar el análisis manualmente después de hacer cambios:

```bash
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml up sonar-scanner
```

## 📊 Métricas Analizadas

### Backend (Python/FastAPI)
- ✅ Bugs y vulnerabilidades
- ✅ Code smells
- ✅ Cobertura de código (si se genera `coverage.xml`)
- ✅ Duplicación de código
- ✅ Complejidad ciclomática

### Frontend (TypeScript/JavaScript)
- ✅ Bugs y vulnerabilidades
- ✅ Code smells
- ✅ Cobertura de código (si se genera `coverage/lcov.info`)
- ✅ Duplicación de código
- ✅ Complejidad ciclomática

## 🔧 Configuración Avanzada

### Generar Reportes de Cobertura

#### Backend (Python)
```bash
cd athletics_fastapi
python -m venv .venv
.venv\Scripts\activate  # En Windows
# source .venv/bin/activate  # En Linux/Mac
pip install pytest pytest-cov
pytest --cov=app --cov-report=xml:coverage.xml
```

#### Frontend (JavaScript/TypeScript)
```bash
cd athletics_vite_ui
npm install
npm run test:coverage
```

### Personalizar el Análisis

Edita `ci/sonarqube/sonar-project.properties` para:
- Cambiar exclusiones de archivos
- Ajustar rutas de reportes de cobertura
- Modificar configuraciones específicas de lenguaje

## 🛑 Detener SonarQube

```bash
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml down
```

### Eliminar también los volúmenes (datos)
```bash
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml down -v
```

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose-sonarqube.yml logs -f sonarqube

# Ver estado de los contenedores
docker-compose -f docker-compose-sonarqube.yml ps

# Reiniciar servicios
docker-compose -f docker-compose-sonarqube.yml restart
```

## 📝 Notas Importantes

1. **Primera ejecución**: SonarQube puede tardar 1-2 minutos en iniciar completamente
2. **Recursos**: SonarQube requiere al menos 2GB de RAM
3. **Persistencia**: Los datos se guardan en volúmenes de Docker
4. **Seguridad**: Cambia las credenciales por defecto en producción
5. **Red**: Los servicios usan la red `sonarqube-network`

## 🐛 Solución de Problemas

### SonarQube no inicia
```bash
# Verificar logs
docker logs sonarqube-server

# Verificar que PostgreSQL esté corriendo
docker logs sonarqube-postgres
```

### El scanner falla
```bash
# Verificar que SonarQube esté completamente iniciado
curl http://localhost:9000/api/system/status

# Ver logs del scanner
docker logs sonarqube-scanner
```

### Error de memoria
Aumenta la memoria de Docker en la configuración de Docker Desktop (mínimo 4GB recomendado).

### Error de red
```bash
# Verificar que la red existe
docker network ls | grep sonarqube

# Recrear servicios si es necesario
cd ci/sonarqube
docker-compose -f docker-compose-sonarqube.yml down
docker-compose -f docker-compose-sonarqube.yml up -d
```

## 📚 Recursos - SonarQube

- [Documentación de SonarQube](https://docs.sonarqube.org/)
- [SonarQube Scanner CLI](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [Análisis de Python](https://docs.sonarqube.org/latest/analysis/languages/python/)
- [Análisis de JavaScript/TypeScript](https://docs.sonarqube.org/latest/analysis/languages/javascript/)

---

# 🔥 Pruebas de Estrés y Rendimiento (ISO 25010)

## 🎯 Objetivo

Evaluar la **Eficiencia de Desempeño** del sistema según la norma ISO/IEC 25010, midiendo:
- ✅ Comportamiento Temporal (tiempos de respuesta)
- ✅ Utilización de Recursos (CPU, memoria, red)
- ✅ Capacidad (usuarios concurrentes máximos)

## 🚀 Inicio Rápido

```bash
cd ci/stress_tests
docker-compose -f docker-compose-stress.yml up -d
```

Esto levantará:
- **JMeter** - Pruebas de carga
- **Gatling** - Pruebas de rendimiento
- **Prometheus** - Recolección de métricas (puerto 9090)
- **Grafana** - Visualización (puerto 3000)
- **cAdvisor** - Monitoreo de contenedores (puerto 8080)

## 📊 Tipos de Pruebas

### 1. Pruebas de Carga
```bash
# Con JMeter
docker exec jmeter-stress-test jmeter -n -t /tests/load_test.jmx -l /results/load_test.jtl

# Con Gatling
docker exec gatling-stress-test gatling.sh -s athletics.LoadTestSimulation
```

### 2. Pruebas de Estrés
```bash
# Con Gatling (hasta 1000+ usuarios)
docker exec gatling-stress-test gatling.sh -s athletics.StressTestSimulation
```

### 3. Monitoreo de Recursos
```bash
# Docker Stats en tiempo real
docker stats fastapi-app springboot-app postgres-db mariadb-db

# Acceder a cAdvisor
# http://localhost:8080

# Acceder a Grafana
# http://localhost:3000 (admin/admin)
```

## 📝 Documentación Completa

Para instrucciones detalladas, configuración y análisis de resultados, consulta:
- [`stress_tests/README.md`](stress_tests/README.md) - Guía completa de pruebas de estrés

## 📚 Recursos - Pruebas de Estrés

- [ISO/IEC 25010](https://www.iso.org/standard/35733.html) - Calidad de Software
- [Apache JMeter](https://jmeter.apache.org/) - Documentación oficial
- [Gatling](https://gatling.io/docs/) - Documentación oficial
- [Prometheus](https://prometheus.io/docs/) - Monitoreo
- [Grafana](https://grafana.com/docs/) - Visualización

---

**Módulo de Deportes y Atletismo - Universidad Nacional de Loja**
