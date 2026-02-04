import pyotp
import qrcode
import io
import base64
import json
from typing import Optional
from passlib.context import CryptContext


class TwoFactorService:
    """Servicio para gestionar autenticación de dos factores (2FA) con TOTP."""
    
    def __init__(self):
        self.issuer_name = "Aplicación de Atletismo"
        # Hasher para backup codes (mismo que contraseñas)
        self.hasher = CryptContext(schemes=["argon2"], deprecated="auto")
    
    def generate_secret(self) -> str:
        """
        Genera un secret aleatorio (base32) para configurar TOTP.
        
        Returns:
            str: Secret key.
        """
        return pyotp.random_base32()
    
    def get_totp_uri(self, secret: str, user_email: str) -> str:
        """
        Genera la URI estandarizada (otpauth://) para configurar aplicaciones de autenticación.
        
        Args:
            secret (str): Secret key del usuario.
            user_email (str): Email del usuario (como identificador).
            
        Returns:
            str: URI de aprovisionamiento.
        """
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(
            name=user_email,
            issuer_name=self.issuer_name
        )
    
    def generate_qr_code(self, secret: str, user_email: str) -> str:
        """
        Genera un código QR en formato imagen Base64 listo para mostrarse en el frontend.
        
        Args:
            secret (str): Secret key.
            user_email (str): Email del usuario.
            
        Returns:
            str: Data URL de la imagen (data:image/png;base64,...).
        """
        uri = self.get_totp_uri(secret, user_email)
        
        # Crear QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        # Convertir a imagen
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convertir a base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def verify_totp_code(self, secret: str, code: str) -> bool:
        """
        Verifica si un código TOTP proporcionado es válido para el secreto dado.
        
        Permite una ventana de tolerancia de ±30 segundos (valid_window=1) para
        compensar pequeñas desincronizaciones de reloj entre servidor y cliente.
        
        Args:
            secret (str): Secret key almacenado.
            code (str): Código de 6 dígitos ingresado por el usuario.
            
        Returns:
            bool: True si es válido.
        """
        if not secret or not code:
            return False
        
        try:
            totp = pyotp.TOTP(secret)
            # valid_window=1 permite códigos del período anterior y siguiente
            return totp.verify(code, valid_window=1)
        except Exception as e:
            from app.core.logging.logger import logger
            logger.error(f"Error verificando código TOTP: {e}")
            return False

    def get_current_code(self, secret: str) -> str:
        """
        Obtiene el código actual (útil para testing).
        NO usar en producción para mostrar al usuario.
        """
        totp = pyotp.TOTP(secret)
        return totp.now()
    
    def get_backup_codes(self, count: int = 10) -> list[str]:
        """
        Genera una lista de códigos de respaldo de un solo uso.
        
        Estos códigos permiten el acceso cuando el usuario pierde su dispositivo 2FA.
        
        Args:
            count (int): Cantidad de códigos a generar.
            
        Returns:
            list[str]: Lista de códigos en texto plano (ej. "ABCD-1234").
        """
        import secrets
        import string
        
        codes = []
        for _ in range(count):
            # Generar código de 8 caracteres
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            # Formatear como XXXX-XXXX
            formatted = f"{code[:4]}-{code[4:]}"
            codes.append(formatted)
        
        return codes
    
    def hash_backup_codes(self, codes: list[str]) -> str:
        """
        Hashea una lista de códigos de respaldo para almacenamiento seguro.
        
        Args:
            codes (list[str]): Lista de códigos en texto plano.
            
        Returns:
            str: String JSON conteniendo la lista de hashes.
        """
        hashed = [self.hasher.hash(code) for code in codes]
        return json.dumps(hashed)
    
    def verify_backup_code(self, backup_codes_json: Optional[str], code: str) -> bool:
        """
        Verifica si un código ingresado coincide con alguno de los códigos de respaldo almacenados.
        
        Esta función solo verifica la validez, no elimina el código usado (eso lo hace remove_used_backup_code).
        
        Args:
            backup_codes_json (Optional[str]): JSON string con los hashes guardados.
            code (str): Código ingresado por el usuario.
            
        Returns:
            bool: True si el código es válido.
        """
        if not backup_codes_json or not code:
            return False
        
        try:
            hashed_codes = json.loads(backup_codes_json)
            for hashed_code in hashed_codes:
                if self.hasher.verify(code, hashed_code):
                    return True
            return False
        except Exception as e:
            from app.core.logging.logger import logger
            logger.error(f"Error verificando código de respaldo: {e}")
            return False
    
    def remove_used_backup_code(self, backup_codes_json: str, used_code: str) -> str:
        """
        Elimina el hash correspondiente a un código usado de la lista almacenada.
        
        Args:
            backup_codes_json (str): JSON string original con los hashes.
            used_code (str): El código en texto plano que se acaba de usar.
            
        Returns:
            str: Nuevo JSON string con el código eliminado.
        """
        try:
            hashed_codes = json.loads(backup_codes_json)
            # Filtrar el código que coincide
            remaining_codes = [
                hashed_code for hashed_code in hashed_codes
                if not self.hasher.verify(used_code, hashed_code)
            ]
            return json.dumps(remaining_codes)
        except Exception as e:
            from app.core.logging.logger import logger
            logger.error(f"Error eliminando código de respaldo usado: {e}")
            return backup_codes_json


