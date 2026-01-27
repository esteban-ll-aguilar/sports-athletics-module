from app.core.config.enviroment import _SETTINGS
from app.providers.email.email_provider import EmailProvider


class AuthEmailService(EmailProvider):
        
    def send_reset_code(self, to_email: str, code: str) -> None:
        subject = "Código para restablecer tu contraseña"
        body = (
            f"Tu código de verificación es: {code}\n\n"
            "Este código expira en 5 minutos. Si no solicitaste este cambio, ignora este correo."
        )
        self._send_email(to_email, subject, body)

    def send_password_changed_confirmation(self, to_email: str) -> None:
        """Envía confirmación de que la contraseña fue cambiada exitosamente."""
        subject = "Contraseña restablecida exitosamente"
        body = (
            "Tu contraseña ha sido restablecida exitosamente.\n\n"
            "Si no realizaste este cambio, contacta inmediatamente con soporte.\n\n"
            "Por tu seguridad, te recomendamos:\n"
            "- Usar una contraseña única y segura\n"
            "- No compartir tus credenciales con nadie\n"
            "- Cerrar sesión en dispositivos que no uses"
        )
        self._send_email(to_email, subject, body)

    def send_email_verification_code(self, to_email: str, code: str) -> None:
        """Envía código de verificación de email."""
        subject = "Verifica tu cuenta"
        body = (
            f"¡Bienvenido!\n\n"
            f"Tu código de verificación es: {code}\n\n"
            "Este código expira en 1 hora. "
            "Por favor ingresa este código para activar tu cuenta."
        )
        # LOG CODE FOR DEBUGGING
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔑 VERIFICATION CODE for {to_email}: {code}")
        
        self._send_email(to_email, subject, body)
# ============================================
    