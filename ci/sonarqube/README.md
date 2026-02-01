# 🚀 Análisis de SonarQube con Cobertura Automática

Este documento explica cómo ejecutar el análisis de SonarQube con generación automática de cobertura de código.

## 📋 Descripción

El sistema está configurado para:

1. ✅ **Generar automáticamente** reportes de cobertura de código
2. ✅ **Ejecutar tests** del backend (Python) y frontend (JavaScript/TypeScript)
3. ✅ **Analizar el código** con SonarQube
4. ✅ **Visualizar resultados** en el dashboard de SonarQube

**Todo es automático** - solo necesitas ejecutar un comando.

## 🎯 Flujo Automático

```
┌─────────────────────────────────────────────────────────────┐
│  1. Inicia SonarQube Server + PostgreSQL                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Coverage Generator (Servicio Automático)                │
│     ├─ Instala dependencias de Python                       │
│     ├─ Ejecuta tests del backend con pytest-cov             │
│     ├─ Genera coverage.xml                                  │
│     ├─ Instala Node.js y dependencias                       │
│     ├─ Ejecuta tests del frontend con Vitest                │
│     └─ Genera coverage/lcov.info                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. SonarQube Scanner                                        │
│     ├─ Lee los reportes de cobertura                        │
│     ├─ Analiza el código fuente                             │
│     └─ Envía resultados a SonarQube                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Resultados disponibles en http://localhost:9000         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Uso

### Ejecutar Análisis Completo (Un Solo Comando)

```bash
# Desde la raíz del proyecto
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up
```

Eso es todo! El sistema:
- ✅ Levantará SonarQube
- ✅ Generará la cobertura automáticamente
- ✅ Ejecutará el análisis
- ✅ Mostrará los resultados

### Ver Logs en Tiempo Real

```bash
# Ver todos los logs
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up

# Ver solo logs del generador de cobertura
docker logs -f coverage-generator

# Ver solo logs del scanner
docker logs -f sonarqube-scanner
```

### Detener los Servicios

```bash
# Detener y eliminar contenedores
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml down

# Detener y eliminar TODO (incluyendo volúmenes)
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml down -v
```

## 📊 Acceder a los Resultados

### SonarQube Dashboard

1. **URL**: http://localhost:9000
2. **Usuario**: `admin`
3. **Contraseña**: `Admin*123` (definida en `.env.sonar`)

### Navegar por los Resultados

Una vez dentro de SonarQube:

1. **Dashboard Principal** → Vista general del proyecto
2. **Issues** → Problemas detectados (bugs, vulnerabilidades, code smells)
3. **Measures** → Métricas detalladas
4. **Code** → Navegación por archivos con cobertura línea por línea
5. **Activity** → Historial de análisis

### Ver Cobertura por Módulo

En el dashboard, puedes filtrar por:

- **`athletics_fastapi/`** - Backend Python
- **`athletics_vite_ui/`** - Frontend JavaScript/TypeScript

Cada módulo mostrará:
- 📊 Porcentaje de cobertura
- 🐛 Bugs detectados
- 🔒 Vulnerabilidades
- 👃 Code smells
- 📋 Duplicación de código
- ⏱️ Deuda técnica

## 🏗️ Arquitectura de Servicios

### 1. `sonarqube-db` (PostgreSQL)
- Base de datos para SonarQube
- Puerto: 5432 (interno)
- Volumen persistente: `sonarqube_db_data`

### 2. `sonarqube` (SonarQube Server)
- Servidor de análisis de código
- Puerto: 9000 (expuesto)
- Volúmenes: datos, extensiones, logs

### 3. `coverage-generator` (Nuevo - Automático)
- **Imagen**: `python:3.11-slim`
- **Función**: Genera reportes de cobertura
- **Ejecuta**:
  - Tests de Python con pytest-cov
  - Tests de JavaScript/TypeScript con Vitest
- **Genera**:
  - `athletics_fastapi/coverage.xml`
  - `athletics_vite_ui/coverage/lcov.info`
- **Se ejecuta una vez y termina**

### 4. `sonar-scanner` (Scanner)
- **Depende de**: `coverage-generator` (debe completarse primero)
- **Función**: Analiza el código y envía a SonarQube
- **Lee**: Los archivos de cobertura generados

## ⚙️ Configuración

### Archivos de Configuración

#### Backend (Python)
- **`athletics_fastapi/requirements.txt`**: Incluye `pytest-cov==6.0.0`
- **`athletics_fastapi/tests/pytest.ini`**: Configuración de pytest y cobertura
  ```ini
  [pytest]
  addopts = 
      --cov=app
      --cov-report=xml:coverage.xml
      --cov-report=html:htmlcov
      --cov-branch
  ```

#### Frontend (JavaScript/TypeScript)
- **`athletics_vite_ui/package.json`**: Incluye `@vitest/coverage-v8`
- **`athletics_vite_ui/vite.config.js`**: Configuración de Vitest con cobertura
  ```javascript
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    reportsDirectory: './coverage',
  }
  ```

#### SonarQube
- **`ci/sonarqube/sonar-project.properties`**: Configuración del proyecto
  - Define rutas de cobertura
  - Exclusiones de archivos
  - Configuración de módulos

### Variables de Entorno

Archivo: `ci/sonarqube/.env.sonar`

```env
SONAR_HOST_URL=http://sonarqube:9000
SONAR_ADMIN_PASSWORD=Admin*123
POSTGRES_USER=sonar
POSTGRES_PASSWORD=sonar
POSTGRES_DB=sonarqube
```

## 🔧 Solución de Problemas

### Error: "coverage-generator failed"

**Causa**: Falló la generación de cobertura (tests con errores)

**Solución**:
```bash
# Ver logs del generador
docker logs coverage-generator

# El generador continúa aunque fallen algunos tests
# Revisa los logs para ver qué tests fallaron
```

### Error: "No coverage reports found"

**Causa**: Los archivos de cobertura no se generaron

**Verificar**:
```bash
# Verificar si los archivos existen
docker exec sonarqube-scanner ls -la athletics_fastapi/coverage.xml
docker exec sonarqube-scanner ls -la athletics_vite_ui/coverage/lcov.info
```

### SonarQube muestra 0% de cobertura

**Causa**: Los reportes no se están leyendo correctamente

**Verificar**:
1. Revisa los logs del scanner para ver si detectó los archivos
2. Verifica la configuración en `sonar-project.properties`
3. Asegúrate de que las rutas sean correctas

### Contenedor "coverage-generator" no termina

**Causa**: Puede estar esperando entrada o hay un error

**Solución**:
```bash
# Ver logs en tiempo real
docker logs -f coverage-generator

# Forzar detención
docker stop coverage-generator
```

## 📈 Métricas Importantes

### Cobertura de Código
- **Lines**: Líneas de código ejecutadas durante tests
- **Branches**: Ramas condicionales (if/else) cubiertas
- **Functions**: Funciones ejecutadas
- **Statements**: Declaraciones ejecutadas

### Calidad de Código
- **Bugs**: Errores probables en el código
- **Vulnerabilities**: Problemas de seguridad
- **Code Smells**: Código que debería mejorarse
- **Duplications**: Código duplicado
- **Technical Debt**: Tiempo estimado para arreglar problemas

## 🎯 Objetivos Recomendados

| Métrica | Mínimo | Objetivo | Excelente |
|---------|--------|----------|-----------|
| Cobertura | 60% | 80% | 90%+ |
| Bugs | < 10 | < 5 | 0 |
| Vulnerabilidades | 0 | 0 | 0 |
| Code Smells | < 50 | < 20 | < 10 |
| Duplicación | < 5% | < 3% | < 1% |

## 📝 Notas Importantes

- ✅ **Todo es automático**: No necesitas ejecutar scripts manualmente
- ✅ **Persistencia**: Los datos de SonarQube se guardan en volúmenes Docker
- ✅ **Reproducible**: Cada ejecución genera reportes frescos
- ✅ **No afecta el código**: Los reportes están en `.gitignore`
- ✅ **Independiente**: Funciona sin necesidad de entornos virtuales locales

## 🔄 Flujo de Desarrollo Recomendado

1. **Desarrolla código** y escribe tests
2. **Ejecuta el análisis**:
   ```bash
   docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up
   ```
3. **Revisa resultados** en http://localhost:9000
4. **Corrige problemas** detectados
5. **Repite** el proceso

## 🔗 Referencias

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**¿Necesitas ayuda?** Revisa los logs con `docker logs <nombre-contenedor>` para diagnosticar problemas.
