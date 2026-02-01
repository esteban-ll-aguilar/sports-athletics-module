# 🧪 Guía de Ejecución de Tests

## 📁 Estructura de Tests

```
athletics_fastapi/
├── app/                              # Código fuente
├── tests/                            # Tests unitarios
│   ├── pytest.ini                   # Config para tests unitarios
│   ├── modules/
│   └── api/
└── ci/
    └── integration_test/            # Tests de integración
        ├── pytest.ini               # Config para tests de integración
        └── tests/
            ├── test_db_integration.py
            ├── test_redis_integration.py
            └── test_users_api_integration.py
```

## 🎯 Tipos de Tests

### 1️⃣ Tests Unitarios (Unit Tests)

**Ubicación**: `tests/`  
**Requieren**: Solo código (no servicios externos)  
**Cobertura**: ✅ Sí (genera `coverage.xml`)

**Ejecutar desde `athletics_fastapi/`**:
```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Ejecutar tests unitarios con cobertura
pytest -c tests/pytest.ini

# Ver solo tests que pasaron
pytest -c tests/pytest.ini -v

# Ver reporte de cobertura en terminal
pytest -c tests/pytest.ini --cov-report=term
```

**Archivos generados**:
- `coverage.xml` - Para SonarQube
- `htmlcov/` - Reporte HTML (abre `htmlcov/index.html`)

### 2️⃣ Tests de Integración (Integration Tests)

**Ubicación**: `ci/integration_test/tests/`  
**Requieren**: Servicios externos (PostgreSQL, Redis, Users API)  
**Cobertura**: ✅ Sí (opcional)

**Ejecutar desde `athletics_fastapi/`**:
```bash
# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Ejecutar tests de integración
pytest -c ci\integration_test\pytest.ini ci\integration_test\tests

# Ejecutar solo tests de Redis
pytest -c ci\integration_test\pytest.ini -m redis ci\integration_test\tests

# Ejecutar solo tests de base de datos
pytest -c ci\integration_test\pytest.ini -m database ci\integration_test\tests

# Con verbose para ver más detalles
pytest -c ci\integration_test\pytest.ini ci\integration_test\tests -v
```

## 📊 Configuraciones de pytest.ini

### Tests Unitarios (`tests/pytest.ini`)

```ini
[pytest]
pythonpath = ..                    # Apunta a athletics_fastapi/
testpaths = tests                  # Busca tests en tests/
addopts = 
    --cov=app                      # Mide cobertura de app/
    --cov-report=xml:coverage.xml  # Genera XML para SonarQube
    --ignore=tests/ci              # ❌ Excluye tests de integración
    --ignore=ci                    # ❌ Excluye carpeta ci/

[coverage:run]
omit = 
    */tests/*                      # No mide cobertura de tests
    */ci/*                         # No mide cobertura de ci/
```

### Tests de Integración (`ci/integration_test/pytest.ini`)

```ini
[pytest]
pythonpath = .                     # Apunta a athletics_fastapi/
testpaths = ci/integration_test/tests  # Busca tests aquí
addopts = 
    -v
    --tb=short

[coverage:run]
source = app                       # Mide cobertura de app/
omit = 
    */tests/*                      # No mide cobertura de tests unitarios
    */test_*.py                    # No mide archivos de test
    # ✅ NO omite */ci/* porque queremos medir cobertura
```

## 🔍 Diferencias Clave

| Aspecto | Tests Unitarios | Tests de Integración |
|---------|----------------|---------------------|
| **Ubicación** | `tests/` | `ci/integration_test/tests/` |
| **pythonpath** | `..` | `.` |
| **testpaths** | `tests` | `ci/integration_test/tests` |
| **Servicios externos** | ❌ No requiere | ✅ Requiere (DB, Redis) |
| **Cobertura** | ✅ Siempre | ✅ Opcional |
| **Exclusiones** | Excluye `ci/` | NO excluye `ci/` |
| **Velocidad** | ⚡ Rápido | 🐢 Lento |

## 🚀 Ejecución en Docker (Automático)

El `docker-compose` ejecuta **solo tests unitarios** con cobertura:

```yaml
coverage-generator:
  command: >
    pytest -c tests/pytest.ini  # Solo unitarios
```

Los tests de integración se ejecutan por separado cuando los servicios están disponibles.

## 📈 Ver Reportes de Cobertura

### Reporte en Terminal
```bash
pytest -c tests/pytest.ini --cov-report=term-missing
```

### Reporte HTML
```bash
pytest -c tests/pytest.ini
# Abre el archivo generado
start htmlcov/index.html  # Windows
```

### Reporte XML (para SonarQube)
```bash
pytest -c tests/pytest.ini
# Archivo generado: coverage.xml
```

## 🎯 Comandos Útiles

### Ejecutar tests específicos
```bash
# Un archivo específico
pytest tests/modules/auth/test_auth_service.py

# Una clase específica
pytest tests/modules/auth/test_auth_service.py::TestAuthService

# Un test específico
pytest tests/modules/auth/test_auth_service.py::TestAuthService::test_login
```

### Ejecutar con marcadores
```bash
# Solo tests de integración
pytest -c ci/integration_test/pytest.ini -m integration

# Solo tests lentos
pytest -c ci/integration_test/pytest.ini -m slow

# Excluir tests lentos
pytest -c ci/integration_test/pytest.ini -m "not slow"
```

### Ver más información
```bash
# Modo verbose
pytest -c tests/pytest.ini -v

# Mostrar print statements
pytest -c tests/pytest.ini -s

# Detener en el primer fallo
pytest -c tests/pytest.ini -x

# Mostrar tests más lentos
pytest -c tests/pytest.ini --durations=10
```

## ⚠️ Problemas Comunes

### Error: "No module named 'app'"
**Solución**: Verifica que `pythonpath` esté configurado correctamente en pytest.ini

### Error: "No tests ran"
**Solución**: Verifica que `testpaths` apunte al directorio correcto

### Tests de integración fallan
**Solución**: Asegúrate de que los servicios externos (DB, Redis) estén corriendo

### Cobertura en 0%
**Solución**: Verifica que `source = app` esté configurado en `[coverage:run]`

## 📝 Resumen

**Para desarrollo diario** (tests rápidos):
```bash
pytest -c tests/pytest.ini
```

**Para verificación completa** (con servicios):
```bash
pytest -c ci\integration_test\pytest.ini ci\integration_test\tests
```

**Para análisis de SonarQube** (automático en Docker):
```bash
docker-compose -f ci/sonarqube/docker-compose-sonarqube.yml up
```
