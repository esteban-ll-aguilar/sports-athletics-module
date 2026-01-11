import pytest
from unittest.mock import AsyncMock, MagicMock

from app.modules.auth.services.email_verification_service import EmailVerificationService


# ---------------------------------
# Fixture Redis mock
# ---------------------------------
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
    redis.ttl = AsyncMock()

    return redis


@pytest.fixture
def service(redis_mock):
    return EmailVerificationService(redis_client=redis_mock)


# ---------------------------------
# generate_verification_code
# ---------------------------------
def test_generate_verification_code():
    service = EmailVerificationService(redis_client=MagicMock())

    code = service.generate_verification_code()

    assert len(code) == 6
    assert code.isdigit()


# ---------------------------------
# store_verification_code
# ---------------------------------
@pytest.mark.asyncio
async def test_store_verification_code(service, redis_mock):
    email = "test@email.com"
    code = "123456"

    await service.store_verification_code(email, code)

    key = f"email_verification:{email}"

    redis_mock.hset.assert_called_once_with(
        key,
        mapping={"code": code, "attempts": "0"}
    )
    redis_mock.expire.assert_called_once_with(key, service.expiry_seconds)
    redis_mock.execute.assert_called_once()


# ---------------------------------
# validate_verification_code
# ---------------------------------
@pytest.mark.asyncio
async def test_validate_verification_code_ok(service, redis_mock):
    email = "test@email.com"
    code = "123456"

    redis_mock.hgetall.return_value = {
        "code": code,
        "attempts": "0"
    }

    result = await service.validate_verification_code(email, code)

    assert result is True
    redis_mock.delete.assert_called_once()


@pytest.mark.asyncio
async def test_validate_verification_code_invalid(service, redis_mock):
    email = "test@email.com"

    redis_mock.hgetall.return_value = {
        "code": "654321",
        "attempts": "0"
    }

    result = await service.validate_verification_code(email, "123456")

    assert result is False
    redis_mock.hincrby.assert_called_once()


@pytest.mark.asyncio
async def test_validate_verification_code_max_attempts(service, redis_mock):
    email = "test@email.com"

    redis_mock.hgetall.return_value = {
        "code": "123456",
        "attempts": str(service.max_attempts)
    }

    result = await service.validate_verification_code(email, "123456")

    assert result is False
    redis_mock.delete.assert_called_once()


@pytest.mark.asyncio
async def test_validate_verification_code_not_found(service, redis_mock):
    redis_mock.hgetall.return_value = {}

    result = await service.validate_verification_code("test@email.com", "123456")

    assert result is False


# ---------------------------------
# delete_verification_code
# ---------------------------------
@pytest.mark.asyncio
async def test_delete_verification_code(service, redis_mock):
    email = "test@email.com"

    await service.delete_verification_code(email)

    redis_mock.delete.assert_called_once_with(
        f"email_verification:{email}"
    )


# ---------------------------------
# code_exists
# ---------------------------------
@pytest.mark.asyncio
async def test_code_exists_true(service, redis_mock):
    redis_mock.exists.return_value = 1

    result = await service.code_exists("test@email.com")

    assert result is True


@pytest.mark.asyncio
async def test_code_exists_false(service, redis_mock):
    redis_mock.exists.return_value = 0

    result = await service.code_exists("test@email.com")

    assert result is False


# ---------------------------------
# get_remaining_time
# ---------------------------------
@pytest.mark.asyncio
async def test_get_remaining_time_ok(service, redis_mock):
    redis_mock.ttl.return_value = 300

    result = await service.get_remaining_time("test@email.com")

    assert result == 300


@pytest.mark.asyncio
async def test_get_remaining_time_expired(service, redis_mock):
    redis_mock.ttl.return_value = -1

    result = await service.get_remaining_time("test@email.com")

    assert result is None
