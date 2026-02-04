# 🏗️ Arquitectura de Pruebas de Integración

## 📊 Estructura Visual

```
athletics_fastapi/
├── ci/
│   ├── __main__.py                          # Runner principal (unitarios + integración)
│   └── integration_test/
│       ├── __init__.py                      # Módulo Python
│       ├── __main__.py                      # Runner de integración
│       ├── conftest.py                      # Fixtures y configuración
│       ├── pytest.ini                       # Configuración pytest
│       │
│       ├── 📝 Tests
│       ├── test_database_integration.py     # 15 tests - PostgreSQL
│       ├── test_redis_integration.py        # 20 tests - Redis Cache
│       ├── test_email_integration.py        # 15 tests - SMTP
│       ├── test_api_integration.py          # 21 tests - API Endpoints
│       └── test_external_services.py        # 12 tests - Spring Boot
│       │
│       ├── 🚀 Scripts
│       ├── run_tests.py                     # Runner con filtros
│       └── setup_check.py                   # Verificación de setup
│       │
│       └── 📚 Documentación
│           ├── README.md                    # Guía principal
│           ├── TEST_COVERAGE.md             # Resumen de cobertura
│           ├── EXAMPLES.md                  # Ejemplos de uso
│           ├── IMPLEMENTATION_SUMMARY.md    # Resumen de implementación
│           └── ARCHITECTURE.md              # Este archivo
```

## 🔄 Flujo de Ejecución

```
┌─────────────────────────────────────────────────────────────┐
│                    python ci                                │
│                    (Runner Principal)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              🧪 UNITARY TESTS                               │
│              python tests/tests.py                          │
│              ✅ Pasa → Continuar                            │
│              ❌ Falla → EXIT                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         🧪 INTEGRATION TESTS                                │
│         python -m ci.integration_test                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              pytest ci/integration_test/                    │
│              (Ejecuta todos los archivos test_*.py)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──────────────────┬──────────────────┐
                       │                  │                  │
                       ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  Database    │  │    Redis     │  │    Email     │
            │  15 tests    │  │   20 tests   │  │  15 tests    │
            └──────────────┘  └──────────────┘  └──────────────┘
                       │                  │                  │
                       ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐
            │     API      │  │   External   │
            │   21 tests   │  │   Services   │
            └──────────────┘  │   12 tests   │
                              └──────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ ALL TESTS PASSED                            │
│              🎉 Success Report                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 Dependencias entre Tests

```
┌─────────────────────────────────────────────────────────────┐
│                      Application                            │
│                      (FastAPI)                              │
└───┬───────────┬───────────┬──────────┬──────────────────────┘
    │           │           │          │
    │           │           │          │
    ▼           ▼           ▼          ▼
┌─────┐   ┌─────────┐  ┌───────┐  ┌────────────┐
│ DB  │   │  Redis  │  │ Email │  │   Users    │
│Tests│   │  Tests  │  │ Tests │  │ API Tests  │
└──┬──┘   └────┬────┘  └───┬───┘  └─────┬──────┘
   │           │           │            │
   │           │           │            │
   └───────────┴───────────┴────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  API Tests   │
            │ (Integración)│
            └──────────────┘
```

## 🎯 Capas de Testing

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: End-to-End Tests (Futura implementación)         │
│  - User journeys completos                                  │
│  - Tests de UI                                              │
└─────────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Integration Tests (✅ IMPLEMENTADO)               │
│  - Database integration                                     │
│  - Redis integration                                        │
│  - Email integration                                        │
│  - API endpoints                                            │
│  - External services                                        │
└─────────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Unit Tests (Existentes)                          │
│  - Funciones individuales                                   │
│  - Clases aisladas                                          │
│  - Lógica de negocio                                        │
└─────────────────────────────────────────────────────────────┘
                            ▲
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Código de Aplicación                             │
│  - Modelos                                                  │
│  - Servicios                                                │
│  - API Endpoints                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes del Sistema de Tests

### 1. Test Runners

```
run_tests.py
├── Argumentos CLI
├── Filtros por tipo
├── Markers de pytest
└── Output formateado

__main__.py
├── Banner colorido
├── Ejecución secuencial
├── Reportes de éxito/fallo
└── Exit codes
```

### 2. Fixtures (conftest.py)

```
conftest.py
├── event_loop          → Event loop async
├── clean_redis         → Limpieza automática
├── db_session          → Sesión con rollback
├── client              → Cliente HTTP async
├── check_external_     → Verificación de servicios
│   services
├── require_database    → Skip condicional DB
├── require_redis       → Skip condicional Redis
└── require_users_api   → Skip condicional API
```

### 3. Configuración (pytest.ini)

```
pytest.ini
├── Patterns de test discovery
├── Asyncio mode
├── Output options (verbose, colors)
├── Markers (integration, slow, external)
├── Timeouts
└── Logging configuration
```

## 📊 Flujo de un Test Individual

```
┌─────────────────────────────────────────────────────────────┐
│  1. Setup (conftest.py)                                     │
│     - Inicializar fixtures                                  │
│     - Verificar servicios disponibles                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Test Execution                                          │
│     - Ejecutar test async                                   │
│     - Usar fixtures (db_session, client, etc.)              │
│     - Assertions                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Cleanup (fixtures)                                      │
│     - Rollback DB transactions                              │
│     - Limpiar Redis (test:* keys)                           │
│     - Cerrar conexiones                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Report                                                  │
│     - ✅ PASSED / ❌ FAILED / ⚠️ SKIPPED                    │
│     - Logs y output                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Servicios Integrados

```
┌──────────────────────────────────────────────────────────────┐
│                    Docker Compose                            │
├──────────────────┬───────────────┬───────────────┬───────────┤
│   PostgreSQL     │    Redis      │  Spring Boot  │  MariaDB  │
│   Port: 5432     │  Port: 6379   │  Port: 8096   │Port: 3306 │
│                  │               │               │           │
│  ✅ Database     │  ✅ Cache     │  ✅ Users API │✅ Spring  │
│     Tests        │     Tests     │     Tests     │   DB      │
└──────────────────┴───────────────┴───────────────┴───────────┘
           │                │               │            │
           └────────────────┴───────────────┴────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   FastAPI App    │
                  │   Port: 8080     │
                  │                  │
                  │  ✅ API Tests    │
                  └──────────────────┘
```

## 🔄 Ciclo de Vida de Tests

### Durante Desarrollo
```
Developer
    │
    ├─► Edit code
    │
    ├─► Run quick tests
    │   (python ci/integration_test/run_tests.py --quick)
    │
    ├─► Debug if needed
    │   (pytest path/to/test.py::test_name -vv -s)
    │
    └─► Run full suite
        (python ci)
```

### En CI/CD
```
Git Push
    │
    ├─► Trigger Pipeline
    │
    ├─► Setup Environment
    │   (docker-compose up -d)
    │
    ├─► Run Unit Tests
    │
    ├─► Run Integration Tests
    │   (python ci)
    │
    ├─► Generate Reports
    │   (--junit-xml, --cov)
    │
    └─► Deploy if success
```

## 📝 Patrones de Diseño Utilizados

### 1. Singleton Pattern
```python
class DatabaseBase:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

### 2. Factory Pattern
```python
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    # Factory para crear sesiones de DB
```

### 3. Dependency Injection
```python
@pytest.fixture
async def client() -> AsyncGenerator:
    # Inyecta cliente HTTP en tests
```

### 4. Setup/Teardown Pattern
```python
@pytest.fixture
async def clean_redis():
    yield  # Test ejecuta aquí
    # Cleanup después del test
```

## 🎨 Convenciones de Código

### Nombres de Tests
- `test_` prefix obligatorio
- Descripción clara: `test_database_connection`
- Agrupados en clases `TestNombreIntegration`

### Estructura de Test
```python
@pytest.mark.asyncio
async def test_nombre_descriptivo(self):
    """Docstring explicando qué verifica el test"""
    
    # Arrange - Preparar datos
    key = "test:key"
    value = "value"
    
    # Act - Ejecutar acción
    await redis_client.set(key, value)
    
    # Assert - Verificar resultado
    result = await redis_client.get(key)
    assert result == value
    
    # Cleanup - Limpiar (si necesario)
    await redis_client.delete(key)
```

### Output
```python
# Usar prints informativos
print(f"\n✅ Test passed")
print(f"📊 Info: {data}")
print(f"⚠️ Warning: {message}")
print(f"❌ Error: {error}")
```

## 🔍 Debugging Flow

```
Test fails
    │
    ├─► Check service availability
    │   (python ci/integration_test/setup_check.py)
    │
    ├─► Run specific test with verbose
    │   (pytest path/to/test.py::test_name -vv -s)
    │
    ├─► Check logs
    │   (--log-cli-level=DEBUG)
    │
    ├─► Verify configuration
    │   (Check .env file)
    │
    └─► Fix and re-run
```

## 📈 Escalabilidad

El sistema está diseñado para escalar fácilmente:

1. **Agregar nuevos tests**: Crear nuevo archivo `test_*.py`
2. **Agregar nuevas categorías**: Actualizar `run_tests.py`
3. **Agregar nuevos fixtures**: Actualizar `conftest.py`
4. **Agregar nuevos servicios**: Crear nuevo archivo de tests

## 🎯 Mejores Prácticas Implementadas

✅ Independencia entre tests
✅ Cleanup automático
✅ Skip inteligente
✅ Timeouts configurados
✅ Assertions descriptivas
✅ Logging informativo
✅ Documentación completa
✅ Fixtures reutilizables
✅ Markers organizados
✅ Output colorido y claro

---

**Arquitectura diseñada para**: Mantenibilidad, Escalabilidad, Claridad
**Última actualización**: 2026-01-21
**Versión**: 1.0.0
