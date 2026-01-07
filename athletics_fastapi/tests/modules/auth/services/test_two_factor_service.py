import pytest
from urllib.parse import unquote

from app.modules.auth.services.two_factor_service import TwoFactorService


# ---------------------------------
# Fixture
# ---------------------------------
@pytest.fixture
def service():
    return TwoFactorService()


# ---------------------------------
# generate_secret
# ---------------------------------
def test_generate_secret(service):
    secret = service.generate_secret()

    assert isinstance(secret, str)
    assert len(secret) >= 16


# ---------------------------------
# get_totp_uri
# ---------------------------------
def test_get_totp_uri(service):
    secret = service.generate_secret()
    uri = service.get_totp_uri(secret, "test@test.com")

    decoded_uri = unquote(uri)

    assert decoded_uri.startswith("otpauth://totp/")
    assert "test@test.com" in decoded_uri
    assert service.issuer_name in decoded_uri
    assert "secret=" in decoded_uri


# ---------------------------------
# generate_qr_code
# ---------------------------------
def test_generate_qr_code(service):
    secret = service.generate_secret()
    qr = service.generate_qr_code(secret, "test@test.com")

    assert isinstance(qr, str)
    assert qr.startswith("data:image/png;base64,")


# ---------------------------------
# get_current_code + verify
# ---------------------------------
def test_get_current_code_and_verify(service):
    secret = service.generate_secret()
    code = service.get_current_code(secret)

    assert service.verify_totp_code(secret, code) is True


def test_verify_totp_code_invalid(service):
    secret = service.generate_secret()

    assert service.verify_totp_code(secret, "000000") is False
    assert service.verify_totp_code("", "123456") is False
    assert service.verify_totp_code(secret, "") is False


# ---------------------------------
# backup codes
# ---------------------------------
def test_get_backup_codes(service):
    codes = service.get_backup_codes()

    assert len(codes) == 10
    assert all("-" in code for code in codes)


def test_hash_backup_codes(service):
    codes = service.get_backup_codes()
    hashed = service.hash_backup_codes(codes)

    assert isinstance(hashed, str)
    assert "[" in hashed


def test_verify_backup_code_ok(service):
    codes = service.get_backup_codes()
    hashed = service.hash_backup_codes(codes)

    assert service.verify_backup_code(hashed, codes[0]) is True


def test_verify_backup_code_invalid(service):
    codes = service.get_backup_codes()
    hashed = service.hash_backup_codes(codes)

    assert service.verify_backup_code(hashed, "INVALID-CODE") is False


def test_verify_backup_code_empty(service):
    assert service.verify_backup_code(None, "CODE") is False
    assert service.verify_backup_code("[]", "") is False


def test_remove_used_backup_code(service):
    codes = service.get_backup_codes()
    hashed = service.hash_backup_codes(codes)

    updated = service.remove_used_backup_code(hashed, codes[0])

    assert service.verify_backup_code(updated, codes[0]) is False
