# 🧪 Pruebas de Integración - Módulo de Atletismo

## 📋 Descripción

Este directorio contiene las pruebas de integración completas para el módulo de atletismo. Las pruebas verifican la correcta integración entre todos los componentes del sistema.

## 🎯 Cobertura de Pruebas

### 1. Base de Datos (PostgreSQL)
**Archivo:** `test_database_integration.py`

- ✅ Conexión y configuración
- ✅ Operaciones CRUD
- ✅ Transacciones (commit/rollback)
- ✅ Constraints (FK, UNIQUE, NOT NULL)
- ✅ Pool de conexiones
- ✅ Conexiones concurrentes
- ✅ Migraciones Alembic
- ✅ Encoding UTF-8
- ✅ Timeouts

### 2. Cache Redis
**Archivo:** `test_redis_integration.py`

- ✅ Conexión y ping
- ✅ Operaciones SET/GET
- ✅ TTL (Time To Live)
- ✅ Operaciones INCR/DECR
- ✅ Hashes (HSET/HGET/HGETALL)
- ✅ Listas (LPUSH/RPUSH/LRANGE)
- ✅ Sets (SADD/SMEMBERS/SISMEMBER)
- ✅ JSON caching
- ✅ Pipelines (batch operations)
- ✅ Pattern matching (KEYS)
- ✅ EXPIRE/PERSIST
- ✅ Operaciones concurrentes
- ✅ Uso de memoria

### 3. Servicio de Email
**Archivo:** `test_email_integration.py`

- ✅ Configuración SMTP
- ✅ Autenticación
- ✅ Capacidades del servidor
- ✅ Creación de mensajes
- ✅ Generación de HTML
- ✅ Múltiples destinatarios
- ✅ Caracteres especiales y emojis
- ✅ TLS/SSL
- ✅ Manejo de errores
- ✅ Timeouts

### 4. API Endpoints
**Archivo:** `test_api_integration.py`

- ✅ Health checks
- ✅ Documentación (Swagger/ReDoc)
- ✅ CORS configuration
- ✅ Autenticación JWT
- ✅ Rate limiting
- ✅ Validación de requests
- ✅ Manejo de errores
- ✅ Archivos estáticos
- ✅ Versionado de API
- ✅ Requests concurrentes
- ✅ Payloads grandes
- ✅ Métodos HTTP

### 5. Servicios Externos
**Archivo:** `test_external_services.py`

- ✅ Microservicio de usuarios (Spring Boot)
- ✅ Health checks externos
- ✅ Autenticación externa
- ✅ Tiempos de respuesta
- ✅ Manejo de errores
- ✅ Conectividad de red
- ✅ Resolución DNS
- ✅ Certificados SSL
- ✅ Timeouts

## 🚀 Ejecución

### Ejecutar todas las pruebas de integración:
```bash
# Desde el directorio athletics_fastapi
python -m ci.integration_test
```

### Ejecutar pruebas específicas:
```bash
# Solo pruebas de base de datos
pytest ci/integration_test/test_database_integration.py -v

# Solo pruebas de Redis
pytest ci/integration_test/test_redis_integration.py -v

# Solo pruebas de email
pytest ci/integration_test/test_email_integration.py -v

# Solo pruebas de API
pytest ci/integration_test/test_api_integration.py -v

# Solo pruebas de servicios externos
pytest ci/integration_test/test_external_services.py -v
```

### Ejecutar tests completos (unitarios + integración):
```bash
# Desde el directorio athletics_fastapi
python ci
```

### Opciones adicionales de pytest:
```bash
# Con más detalles
pytest ci/integration_test/ -vv -s

# Con coverage
pytest ci/integration_test/ --cov=app --cov-report=html

# Solo tests rápidos (excluir lentos)
pytest ci/integration_test/ -m "not slow"

# Solo tests que no requieren servicios externos
pytest ci/integration_test/ -m "not external"

# Parar en el primer fallo
pytest ci/integration_test/ -x

# Ejecutar tests en paralelo (requiere pytest-xdist)
pytest ci/integration_test/ -n auto
```

## 📦 Requisitos Previos

### Servicios necesarios:
1. **PostgreSQL** - Puerto 5432
2. **Redis** - Puerto 6379
3. **Spring Boot (Users API)** - Puerto 8096
4. **MariaDB** - Puerto 3306 (para Spring Boot)

### Iniciar servicios con Docker:
```bash
# Desde el directorio athletics_fastapi
docker-compose up -d
```

### Verificar servicios:
```bash
# PostgreSQL
docker-compose ps postgres

# Redis
docker-compose ps redis

# Spring Boot
docker-compose ps springboot-app

# MariaDB
docker-compose ps mariadb
```

## ⚙️ Configuración

Las pruebas utilizan las variables de entorno del archivo `.env`:

```env
# Database
DATABASE_NAME=BaseDeDatos
DATABASE_USER=postgres
DATABASE_PASSWORD=123456
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Users API
USERS_API_URL=http://localhost:8096
USERS_API_EMAIL=admin@example.com
USERS_API_PASSWORD=admin123
```

## 🎨 Fixtures Disponibles

El archivo `conftest.py` proporciona fixtures útiles:

- `event_loop` - Event loop para tests async
- `clean_redis` - Limpia claves de test en Redis
- `db_session` - Sesión de base de datos con rollback
- `client` - Cliente HTTP async para tests de API
- `check_external_services` - Verifica disponibilidad de servicios
- `require_database` - Salta test si DB no disponible
- `require_redis` - Salta test si Redis no disponible
- `require_users_api` - Salta test si Users API no disponible

## 📊 Reporte de Resultados

Los tests generan output colorido con:
- ✅ Tests exitosos
- ❌ Tests fallidos
- ⚠️ Tests saltados
- ℹ️ Información adicional

### Ejemplo de salida:
```
============================================================
🧪 RUNNING INTEGRATION TESTS
============================================================

test_database_integration.py::TestDatabaseIntegration::test_database_connection ✅ PASSED
test_redis_integration.py::TestRedisIntegration::test_redis_connection ✅ PASSED
test_email_integration.py::TestEmailIntegration::test_email_configuration ✅ PASSED
...

============================================================
✅ ALL INTEGRATION TESTS PASSED
============================================================
```

## 🔍 Debugging

### Ver logs detallados:
```bash
pytest ci/integration_test/ -vv -s --log-cli-level=DEBUG
```

### Ver solo tests fallidos:
```bash
pytest ci/integration_test/ --lf
```

### Ver duración de tests:
```bash
pytest ci/integration_test/ --durations=10
```

## 🛡️ Buenas Prácticas

1. **Aislamiento**: Cada test es independiente y no afecta a otros
2. **Cleanup**: Los tests limpian sus datos después de ejecutarse
3. **Skip inteligente**: Tests se saltan si servicios no están disponibles
4. **Timeouts**: Todos los tests tienen timeouts para evitar colgarse
5. **Assertions claras**: Mensajes descriptivos en cada assert
6. **Logging**: Output informativo para debugging

## 📝 Agregar Nuevos Tests

Para agregar un nuevo test de integración:

1. Crear archivo `test_*.py` en este directorio
2. Crear clase `TestNombreIntegration`
3. Usar decorador `@pytest.mark.asyncio` para tests async
4. Usar fixtures del `conftest.py`
5. Documentar con docstrings

### Ejemplo:
```python
import pytest

class TestMiIntegracion:
    """Suite de pruebas para mi integración"""
    
    @pytest.mark.asyncio
    async def test_mi_funcionalidad(self, client):
        """Verifica que mi funcionalidad funcione"""
        response = await client.get("/mi-endpoint")
        assert response.status_code == 200
```

## 🤝 Contribución

1. Todos los tests deben pasar antes de hacer commit
2. Agregar tests para nuevas funcionalidades
3. Mantener cobertura > 80%
4. Documentar casos edge

## 📞 Soporte

Si tienes problemas con las pruebas de integración:

1. Verifica que todos los servicios estén corriendo
2. Revisa las variables de entorno
3. Ejecuta tests individuales para aislar problemas
4. Revisa los logs con `-vv -s`

## 📚 Referencias

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html)
- [Redis Commands](https://redis.io/commands/)
