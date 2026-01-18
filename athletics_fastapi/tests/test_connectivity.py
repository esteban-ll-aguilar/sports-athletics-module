import asyncio
import sys
import os
import socket

# Añadir el directorio raíz al path para poder importar la app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config.enviroment import _SETTINGS
from app.core.cache.redis import _redis
import smtplib

async def test_redis():
    print("--- Probando Conexión a Redis ---")
    try:
        client = _redis.get_client()
        pong = await asyncio.wait_for(client.ping(), timeout=5.0)
        print(f"✅ Conexión a Redis exitosa: {pong}")
        return True
    except asyncio.TimeoutError:
        print("❌ Error: Timeout conectando a Redis (5s)")
        return False
    except Exception as e:
        print(f"❌ Error conectando a Redis: {e}")
        return False

def test_email_config():
    print("\n--- Probando Configuración de Email ---")
    print(f"Host: {_SETTINGS.email_host}")
    print(f"Port: {_SETTINGS.email_port}")
    print(f"User: {_SETTINGS.email_host_user}")
    
    try:
        # Configurar timeout global para socket
        socket.setdefaulttimeout(10.0)
        
        # Intentar conectar al servidor SMTP
        print("Conectando al servidor SMTP...")
        if _SETTINGS.email_use_tls:
            server = smtplib.SMTP(_SETTINGS.email_host, _SETTINGS.email_port)
            server.ehlo()
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(_SETTINGS.email_host, _SETTINGS.email_port)
        
        print("Iniciando sesión...")
        server.login(_SETTINGS.email_host_user, _SETTINGS.email_host_password)
        print("✅ Inicio de sesión SMTP exitoso.")
        server.quit()
        return True
    except socket.timeout:
        print("❌ Error: Timeout conectando al servidor SMTP (10s)")
        return False
    except Exception as e:
        print(f"❌ Error en configuración de Email: {e}")
        return False

async def main():
    redis_ok = await test_redis()
    email_ok = test_email_config()
    
    if redis_ok and email_ok:
        print("\n✅ Todas las conexiones base son correctas.")
    else:
        print("\n❌ Se encontraron problemas en las conexiones.")

if __name__ == "__main__":
    asyncio.run(main())
