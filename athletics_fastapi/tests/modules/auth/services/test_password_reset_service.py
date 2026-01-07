import pytest
from unittest.mock import AsyncMock, MagicMock

from app.modules.admin.services.password_reset_service import PasswordResetService


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

def test_generate_reset_code_length(service):
    code = service.generate_reset_code()
    assert len(code) == 8
    assert code.isalnum()


@pytest.mark.asyncio
async def test_store_reset_code(service, redis_mock):
    await service.store_reset_code("test@test.com", "ABC12345")

    redis_mock.pipeline.assert_called_once()
    redis_mock.hset.assert_called_once()
    redis_mock.expire.assert_called_once()
    redis_mock.execute.assert_called_once()


@pytest.mark.asyncio
async def test_validate_reset_code_only_ok(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.validate_reset_code_only(
        "test@test.com", "ABC12345"
    )

    assert result is True
    redis_mock.delete.assert_not_called()


@pytest.mark.asyncio
async def test_validate_reset_code_only_invalid(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.validate_reset_code_only(
        "test@test.com", "WRONG"
    )

    assert result is False


@pytest.mark.asyncio
async def test_validate_reset_code_ok(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.validate_reset_code(
        "test@test.com", "ABC12345"
    )

    assert result is True
    redis_mock.hincrby.assert_called_once()
    redis_mock.delete.assert_called_once()


@pytest.mark.asyncio
async def test_validate_reset_code_invalid(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.validate_reset_code(
        "test@test.com", "WRONG"
    )

    assert result is False
    redis_mock.hincrby.assert_called_once()
    redis_mock.delete.assert_not_called()


@pytest.mark.asyncio
async def test_validate_reset_code_max_attempts(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "3",
    }

    result = await service.validate_reset_code(
        "test@test.com", "ABC12345"
    )

    assert result is False
    redis_mock.delete.assert_called_once()


@pytest.mark.asyncio
async def test_consume_reset_code_ok(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.consume_reset_code(
        "test@test.com", "ABC12345"
    )

    assert result is True
    redis_mock.delete.assert_called_once()


@pytest.mark.asyncio
async def test_consume_reset_code_invalid(service, redis_mock):
    redis_mock.hgetall.return_value = {
        "code": "ABC12345",
        "attempts": "0",
    }

    result = await service.consume_reset_code(
        "test@test.com", "WRONG"
    )

    assert result is False
    redis_mock.hincrby.assert_called_once()


@pytest.mark.asyncio
async def test_delete_reset_code(service, redis_mock):
    await service.delete_reset_code("test@test.com")

    redis_mock.delete.assert_called_once_with(
        "password_reset:test@test.com"
    )


@pytest.mark.asyncio
async def test_code_exists(service, redis_mock):
    redis_mock.exists.return_value = 1

    exists = await service.code_exists("test@test.com")

    assert exists is True
