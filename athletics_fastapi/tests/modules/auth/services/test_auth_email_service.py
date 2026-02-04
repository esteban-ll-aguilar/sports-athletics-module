import pytest
from unittest.mock import MagicMock

from app.modules.auth.services.auth_email_service import AuthEmailService


# -----------------------------------
# Fixture del servicio con _send_email mockeado
# -----------------------------------
@pytest.fixture
def email_service():
    service = AuthEmailService()
    service._send_email = MagicMock()
    return service


# -----------------------------------
# send_reset_code()
# -----------------------------------
def test_send_reset_code(email_service):
    to_email = "test@example.com"
    code = "123456"

    email_service.send_reset_code(to_email, code)

    email_service._send_email.assert_called_once()
    args = email_service._send_email.call_args[0]

    


# -----------------------------------
# send_password_changed_confirmation()
# -----------------------------------
def test_send_password_changed_confirmation(email_service):
    to_email = "test@example.com"

    email_service.send_password_changed_confirmation(to_email)

    email_service._send_email.assert_called_once()
    args = email_service._send_email.call_args[0]

    assert args[0] == to_email
    assert "Contraseña restablecida exitosamente" in args[1]
    assert "restablecida exitosamente" in args[2]


# -----------------------------------
# send_email_verification_code()
# -----------------------------------
def test_send_email_verification_code(email_service):
    to_email = "test@example.com"
    code = "ABCDEF"

    email_service.send_email_verification_code(to_email, code)

    email_service._send_email.assert_called_once()
    args = email_service._send_email.call_args[0]

    assert args[0] == to_email
    assert "Verifica tu cuenta" in args[1]
    assert code in args[2]
