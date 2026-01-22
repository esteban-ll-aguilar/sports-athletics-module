"""
Configuración de pytest para pruebas de integración.
Define fixtures y configuraciones compartidas.
"""
import pytest
import asyncio
import sys
import os
from typing import AsyncGenerator

# Asegurar imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))


# Configuración de pytest
def pytest_configure(config):
    """Configuración inicial de pytest"""
    config.addinivalue_line(
        "markers", "integration: mark test as integration test (deselect with '-m \"not integration\"')"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "external: mark test as requiring external services"
    )


# Event loop fixture (necesario para async tests)
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# Fixture para setup/teardown de tests
@pytest.fixture(scope="session", autouse=True)
async def setup_integration_tests():
    """Setup global para todas las pruebas de integración"""
    from app.core.logging.logger import logger
    
    logger.info("🧪 Starting Integration Tests Setup")
    
    # Setup code aquí
    yield
    
    # Teardown code aquí
    logger.info("🧪 Integration Tests Teardown Complete")


# Fixture para limpiar Redis después de cada test
@pytest.fixture(scope="function")
async def clean_redis():
    """Limpia las claves de test de Redis después de cada prueba"""
    yield
    
    # Cleanup
    try:
        from app.core.cache.redis import _redis
        redis_client = _redis.get_client()
        
        # Eliminar solo claves de test
        keys = await redis_client.keys("test:*")
        if keys:
            await redis_client.delete(*keys)
            
    except Exception:
        pass  # Fallar silenciosamente si no hay conexión


# Fixture para sesión de base de datos
@pytest.fixture(scope="function")
async def db_session():
    """Proporciona una sesión de base de datos para tests"""
    from app.core.db.database import _db
    
    session_factory = _db.get_session_factory()
    async with session_factory() as session:
        yield session
        await session.rollback()  # Rollback después de cada test


# Fixture para cliente HTTP de prueba
@pytest.fixture(scope="function")
async def client() -> AsyncGenerator:
    """Proporciona un cliente HTTP async para tests de API"""
    from httpx import AsyncClient, ASGITransport
    from app.main import _APP
    
    async with AsyncClient(
        transport=ASGITransport(app=_APP),
        base_url="http://test"
    ) as c:
        yield c


# Fixture para verificar servicios externos
@pytest.fixture(scope="session")
async def check_external_services():
    """Verifica que los servicios externos estén disponibles"""
    from app.core.config.enviroment import _SETTINGS
    import httpx
    
    services_status = {
        "database": False,
        "redis": False,
        "users_api": False,
    }
    
    # Check Database
    try:
        from app.core.db.database import _db
        engine = _db.get_engine()
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
            services_status["database"] = True
    except Exception:
        pass
    
    # Check Redis
    try:
        from app.core.cache.redis import _redis
        redis_client = _redis.get_client()
        await redis_client.ping()
        services_status["redis"] = True
    except Exception:
        pass
    
    # Check Users API
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{_SETTINGS.users_api_url}/actuator/health"
            )
            if response.status_code == 200:
                services_status["users_api"] = True
    except Exception:
        pass
    
    return services_status


# Fixture para saltar tests si servicios no disponibles
@pytest.fixture(scope="function")
def require_database(check_external_services):
    """Salta el test si la base de datos no está disponible"""
    if not check_external_services["database"]:
        pytest.skip("Database not available")


@pytest.fixture(scope="function")
def require_redis(check_external_services):
    """Salta el test si Redis no está disponible"""
    if not check_external_services["redis"]:
        pytest.skip("Redis not available")


@pytest.fixture(scope="function")
def require_users_api(check_external_services):
    """Salta el test si Users API no está disponible"""
    if not check_external_services["users_api"]:
        pytest.skip("Users API not available")


# Hook para reporte personalizado
def pytest_report_header(config):
    """Agrega información al header del reporte de pytest"""
    return [
        "=" * 60,
        "🧪 INTEGRATION TESTS - Athletics Module",
        "=" * 60,
    ]


# Hook para modificar resultado de tests
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook para capturar resultados de tests"""
    outcome = yield
    rep = outcome.get_result()
    
    # Marcar tests fallidos con información adicional
    if rep.when == "call" and rep.failed:
        # Agregar información adicional en caso de fallo
        pass
