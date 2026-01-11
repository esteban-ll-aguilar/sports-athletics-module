
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.modules.auth.services.password_reset_service import PasswordResetService

# ------------------------------------------------------------------
# FIXTURE: Redis mock
# ------------------------------------------------------------------

@pytest.fixture
def redis_mock():
    redis = MagicMock()
    redis.pipeline.return_value = redis
    redis.hset = AsyncMock()
    redis.expire = AsyncMock()
    redis.execute = AsyncMock()
    redis.hgetall = AsyncMock()
    redis.hincrby = AsyncMock()
    redis.delete = AsyncMock()
    redis.exists = AsyncMock()
    return redis

@pytest.fixture
def service(redis_mock):
    return PasswordResetService(redis_client=redis_mock)

# ------------------------------------------------------------------
# TESTS
# ------------------------------------------------------------------

def test_tc_01_generar_codigo(service):
    """
    TC-01: Generar código de recuperación
    Salida Esperada: Código alfanumérico de 6 caracteres
    """
    code = service.generate_reset_code()
    assert len(code) == 6
    assert code.isalnum()

@pytest.mark.asyncio
async def test_tc_02_guardar_codigo(service, redis_mock):
    """
    TC-02: Guardar Código
    Salida Esperada: Código guardado con expiración
    """
    await service.store_reset_code("test@test.com", "ABC123")
    
    redis_mock.pipeline.assert_called_once()
    redis_mock.hset.assert_called_once()
    redis_mock.expire.assert_called_once()
    redis_mock.execute.assert_called_once()

@pytest.mark.asyncio
async def test_tc_03_validar_codigo_verificacion_ok(service, redis_mock):
    """
    TC-03: Validar Código (solo verificación) Correcto
    Salida Esperada: Retorna True
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    result = await service.validate_reset_code_only("test@test.com", "ABC123")
    
    assert result is True
    redis_mock.delete.assert_not_called()

@pytest.mark.asyncio
async def test_tc_04_validar_codigo_verificacion_incorrecto(service, redis_mock):
    """
    TC-04: Validar Código (solo verificación) Incorrecto
    Salida Esperada: Retorna False
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    result = await service.validate_reset_code_only("test@test.com", "WRONG")
    
    assert result is False
    redis_mock.delete.assert_not_called()

@pytest.mark.asyncio
async def test_tc_05_validar_y_consumir_ok(service, redis_mock):
    """
    TC-05: Validar y Consumir Código Correcto
    Salida Esperada: Retorna True y elimina código
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    # validate_reset_code consume código si es válido
    result = await service.validate_reset_code("test@test.com", "ABC123")
    
    assert result is True
    redis_mock.delete.assert_called_once() # Consumido

@pytest.mark.asyncio
async def test_tc_06_validar_y_consumir_incorrecto(service, redis_mock):
    """
    TC-06: Validar y Consumir Código Incorrecto
    Salida Esperada: Retorna False
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    result = await service.validate_reset_code("test@test.com", "WRONG")
    
    assert result is False
    redis_mock.hincrby.assert_called_once() # Incrementa intentos
    redis_mock.delete.assert_not_called() # No consumido

@pytest.mark.asyncio
async def test_tc_07_validar_codigo_intentos_maximos(service, redis_mock):
    """
    TC-07: Validar Código con intentos máximos
    Salida Esperada: Retorna False y elimina código
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "3", # Max attempts reached
    }
    
    # Tanto validate_reset_code como consume_reset_code chequean intentos
    # Usaremos validate_reset_code que parece ser el principal para "Validar"
    result = await service.validate_reset_code("test@test.com", "ABC123")
    
    assert result is False
    redis_mock.delete.assert_called_once() # Eliminado por seguridad

@pytest.mark.asyncio
async def test_tc_08_consumir_codigo_ok(service, redis_mock):
    """
    TC-08: Consumir Código Válido
    Salida Esperada: Retorna True
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    result = await service.consume_reset_code("test@test.com", "ABC123")
    
    assert result is True
    redis_mock.delete.assert_called_once()

@pytest.mark.asyncio
async def test_tc_09_consumir_codigo_invalido(service, redis_mock):
    """
    TC-09: Consumir Código Inválido
    Salida Esperada: Retorna False
    """
    redis_mock.hgetall.return_value = {
        "code": "ABC123",
        "attempts": "0",
    }
    
    result = await service.consume_reset_code("test@test.com", "WRONG")
    
    assert result is False
    redis_mock.hincrby.assert_called_once()

@pytest.mark.asyncio
async def test_tc_10_eliminar_codigo(service, redis_mock):
    """
    TC-10: Eliminar Código
    Salida Esperada: Código eliminado
    """
    await service.delete_reset_code("test@test.com")
    
    redis_mock.delete.assert_called_once_with("password_reset:test@test.com")

@pytest.mark.asyncio
async def test_tc_11_verificar_existencia(service, redis_mock):
    """
    TC-11: Verificar Existencia
    Salida Esperada: Retorna True/False
    """
    redis_mock.exists.return_value = 1
    
    exists = await service.code_exists("test@test.com")
    
    assert exists is True
    redis_mock.exists.assert_called_once()
