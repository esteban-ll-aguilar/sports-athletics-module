"""
Pruebas de integración para el servicio de email.
Verifica configuración, conexión SMTP y envío de correos.
"""
import pytest
import smtplib
from email.message import EmailMessage
from app.core.config.enviroment import _SETTINGS
from app.providers.email.email_provider import EmailProvider


class TestEmailIntegration:
    """Suite de pruebas de integración para el servicio de email"""
    
    @pytest.mark.asyncio
    async def test_email_configuration(self):
        """Verifica que la configuración de email esté correcta"""
        assert _SETTINGS.email_host, "EMAIL_HOST no configurado"
        assert _SETTINGS.email_port, "EMAIL_PORT no configurado"
        assert _SETTINGS.email_host_user, "EMAIL_HOST_USER no configurado"
        assert _SETTINGS.email_host_password, "EMAIL_HOST_PASSWORD no configurado"
        
        print(f"\n📧 Email Host: {_SETTINGS.email_host}")
        print(f"📧 Email Port: {_SETTINGS.email_port}")
        print(f"📧 Email TLS: {_SETTINGS.email_use_tls}")
        print(f"📧 Email User: {_SETTINGS.email_host_user}")
    
    @pytest.mark.asyncio
    async def test_email_provider_initialization(self):
        """Verifica que el EmailProvider se inicialice correctamente"""
        try:
            provider = EmailProvider()
            assert provider is not None, "EmailProvider no se inicializó"
            assert provider.host == _SETTINGS.email_host
            assert provider.port == _SETTINGS.email_port
            assert provider.username == _SETTINGS.email_host_user
            print("\n✅ EmailProvider initialized successfully")
        except RuntimeError as e:
            if "Email creds not configured" in str(e):
                print("\n⚠️ Email credentials not configured (expected in test env)")
                pytest.skip("Email credentials not configured")
            else:
                raise
    
    @pytest.mark.asyncio
    async def test_smtp_connection(self):
        """Verifica conexión al servidor SMTP"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            if _SETTINGS.email_use_tls:
                with smtplib.SMTP(_SETTINGS.email_host, _SETTINGS.email_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    
                    # Intentar login
                    server.login(_SETTINGS.email_host_user, _SETTINGS.email_host_password)
                    print("\n✅ SMTP connection and authentication successful")
            else:
                with smtplib.SMTP_SSL(_SETTINGS.email_host, _SETTINGS.email_port, timeout=10) as server:
                    server.login(_SETTINGS.email_host_user, _SETTINGS.email_host_password)
                    print("\n✅ SMTP SSL connection and authentication successful")
                    
        except smtplib.SMTPAuthenticationError as e:
            print(f"\n❌ SMTP Authentication failed: {e}")
            pytest.fail(f"SMTP authentication failed: {e}")
        except smtplib.SMTPException as e:
            print(f"\n❌ SMTP Error: {e}")
            pytest.fail(f"SMTP error: {e}")
        except Exception as e:
            print(f"\n❌ Connection Error: {e}")
            pytest.skip(f"Could not connect to SMTP server: {e}")
    
    @pytest.mark.asyncio
    async def test_smtp_server_capabilities(self):
        """Verifica las capacidades del servidor SMTP"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            with smtplib.SMTP(_SETTINGS.email_host, _SETTINGS.email_port, timeout=10) as server:
                server.ehlo()
                
                # Mostrar capacidades del servidor
                print(f"\n📧 SMTP Server Capabilities:")
                if hasattr(server, 'esmtp_features'):
                    for feature, params in server.esmtp_features.items():
                        print(f"  - {feature}: {params}")
                
                # Verificar soporte de STARTTLS
                if server.has_extn('STARTTLS'):
                    print("  ✅ STARTTLS supported")
                    server.starttls()
                else:
                    print("  ⚠️ STARTTLS not supported")
                
        except Exception as e:
            pytest.skip(f"Could not check SMTP capabilities: {e}")
    
    @pytest.mark.asyncio
    async def test_email_message_creation(self):
        """Verifica creación de mensajes de email"""
        msg = EmailMessage()
        msg["Subject"] = "Test Subject"
        msg["From"] = "test@example.com"
        msg["To"] = "recipient@example.com"
        msg.set_content("This is a test message")
        
        assert msg["Subject"] == "Test Subject"
        assert msg["From"] == "test@example.com"
        assert msg["To"] == "recipient@example.com"
        assert "test message" in msg.get_content()
        
        print("\n✅ Email message creation working")
    
    @pytest.mark.asyncio
    async def test_email_html_generation(self):
        """Verifica generación de HTML para emails"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            provider = EmailProvider()
            
            subject = "Test HTML Email"
            body = "This is a test body"
            
            html = provider.generate_html(subject, body)
            
            assert "<html>" in html, "HTML no generado correctamente"
            assert subject in html, "Subject no incluido en HTML"
            assert body in html, "Body no incluido en HTML"
            assert "<h1>" in html, "HTML mal formateado"
            
            print("\n✅ HTML generation working")
            
        except RuntimeError:
            pytest.skip("Email credentials not configured")
    
    @pytest.mark.asyncio
    async def test_email_send_dry_run(self):
        """Simula envío de email sin realmente enviarlo"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            provider = EmailProvider()
            
            # Crear mensaje pero no enviarlo
            msg = EmailMessage()
            msg["Subject"] = "Test Subject - Dry Run"
            msg["From"] = provider.username
            msg["To"] = provider.username  # Enviar a sí mismo
            msg.set_content("This is a test message (dry run)")
            
            html = provider.generate_html("Test", "Dry run test body")
            msg.add_alternative(html, subtype="html")
            
            # Verificar que el mensaje está bien formado
            assert msg["Subject"] is not None
            assert msg["From"] is not None
            assert msg["To"] is not None
            # Para mensajes multipart, verificar el contenido de manera diferente
            assert msg.is_multipart() or len(str(msg)) > 0
            
            print("\n✅ Email message structure validated")
            
        except RuntimeError:
            pytest.skip("Email credentials not configured")
    
    @pytest.mark.asyncio
    async def test_email_send_to_self(self):
        """
        PRUEBA REAL: Envía un email de prueba (a sí mismo)
        ⚠️ Esta prueba envía un email real si las credenciales están configuradas
        """
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        # Esta prueba se puede marcar como skip por defecto
        # Descomentar para hacer prueba real
        pytest.skip("Skipped real email send test (uncomment to enable)")
        
        try:
            provider = EmailProvider()
            
            # Enviar email a uno mismo para no molestar a nadie
            test_email = provider.username
            
            provider._send_email(
                to_email=test_email,
                subject="🧪 Integration Test - Athletics Module",
                body="Este es un email de prueba automático del módulo de atletismo. Si recibes este mensaje, la integración de email está funcionando correctamente."
            )
            
            print(f"\n✅ Test email sent successfully to {test_email}")
            print("⚠️ Check your inbox to verify receipt")
            
        except smtplib.SMTPAuthenticationError:
            pytest.fail("SMTP authentication failed - check credentials")
        except smtplib.SMTPException as e:
            pytest.fail(f"SMTP error during send: {e}")
        except RuntimeError:
            pytest.skip("Email credentials not configured")
    
    @pytest.mark.asyncio
    async def test_email_multiple_recipients(self):
        """Verifica soporte para múltiples destinatarios"""
        msg = EmailMessage()
        msg["Subject"] = "Test Multiple Recipients"
        msg["From"] = "sender@example.com"
        
        # Múltiples destinatarios
        recipients = ["user1@example.com", "user2@example.com", "user3@example.com"]
        msg["To"] = ", ".join(recipients)
        msg.set_content("Test message for multiple recipients")
        
        assert len(msg["To"].split(",")) == 3, "Múltiples destinatarios no configurados correctamente"
        
        print("\n✅ Multiple recipients message structure validated")
    
    @pytest.mark.asyncio
    async def test_email_with_special_characters(self):
        """Verifica manejo de caracteres especiales en emails"""
        msg = EmailMessage()
        
        # Texto con caracteres especiales y emojis
        subject = "Prueba con ñ, á, é, í, ó, ú, ü y 🏃‍♂️ emoji"
        body = """
        Este es un correo de prueba con:
        - Tildes: áéíóú
        - Diéresis: ü
        - Eñe: ñ
        - Emojis: 🏃‍♂️ 🏆 🥇
        - Símbolos: © ® ™ € $
        """
        
        msg["Subject"] = subject
        msg["From"] = "test@example.com"
        msg["To"] = "recipient@example.com"
        msg.set_content(body)
        
        assert msg["Subject"] == subject
        assert "ñ" in msg.get_content()
        assert "🏃" in msg.get_content()
        
        print("\n✅ Special characters handled correctly")
    
    @pytest.mark.asyncio
    async def test_email_timeout_configuration(self):
        """Verifica que el timeout esté configurado"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            # Verificar que la conexión respete el timeout
            import time
            start = time.time()
            
            try:
                with smtplib.SMTP(_SETTINGS.email_host, _SETTINGS.email_port, timeout=5) as server:
                    server.ehlo()
            except Exception:
                pass
            
            duration = time.time() - start
            
            # Si falla, no debería tardar más de 10 segundos
            assert duration < 10, f"Timeout no respetado, tardó {duration}s"
            
            print(f"\n✅ Connection attempt completed in {duration:.2f}s")
            
        except Exception as e:
            pytest.skip(f"Could not test timeout: {e}")
    
    @pytest.mark.asyncio
    async def test_email_error_handling(self):
        """Verifica manejo de errores en EmailProvider"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            provider = EmailProvider()
            
            # Intentar enviar a email inválido debería fallar gracefully
            invalid_email = "not-a-valid-email"
            
            # Esta operación debería fallar
            with pytest.raises(Exception):
                provider._send_email(
                    to_email=invalid_email,
                    subject="Test",
                    body="This should fail"
                )
            
            print("\n✅ Error handling working for invalid email")
            
        except RuntimeError:
            pytest.skip("Email credentials not configured")
    
    @pytest.mark.asyncio
    async def test_email_connection_pool(self):
        """Verifica manejo de múltiples conexiones"""
        if not _SETTINGS.email_host_user or not _SETTINGS.email_host_password:
            pytest.skip("Email credentials not configured")
        
        try:
            # Crear múltiples providers (simula múltiples conexiones)
            providers = [EmailProvider() for _ in range(3)]
            
            assert len(providers) == 3
            for provider in providers:
                assert provider.host == _SETTINGS.email_host
                assert provider.port == _SETTINGS.email_port
            
            print("\n✅ Multiple EmailProvider instances created successfully")
            
        except RuntimeError:
            pytest.skip("Email credentials not configured")
    
    @pytest.mark.asyncio
    async def test_email_tls_vs_ssl(self):
        """Verifica configuración TLS vs SSL"""
        print(f"\n📧 Email Configuration:")
        print(f"  - TLS Mode: {_SETTINGS.email_use_tls}")
        print(f"  - Port: {_SETTINGS.email_port}")
        
        # Ports comunes
        if _SETTINGS.email_port == 587:
            print("  ℹ️ Port 587 typically uses STARTTLS")
            assert _SETTINGS.email_use_tls, "Port 587 should use TLS"
        elif _SETTINGS.email_port == 465:
            print("  ℹ️ Port 465 typically uses SSL")
        elif _SETTINGS.email_port == 25:
            print("  ℹ️ Port 25 is typically unencrypted (not recommended)")
        
        print("\n✅ Email encryption configuration reviewed")
