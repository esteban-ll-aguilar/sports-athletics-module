import pyotp
import qrcode
import io
import base64
import json
from typing import Tuple, Optional
from passlib.context import CryptContext


class TwoFactorService:
    """Servicio para gestionar autenticación de dos factores (2FA) con TOTP."""
    
    def __init__(self):
        self.issuer_name = "Dalios Facturacion SRI"
        # Hasher para backup codes (mismo que contraseñas)
        self.hasher = CryptContext(schemes=["argon2"], deprecated="auto")
    
    def generate_secret(self) -> str:
        """Genera un secret aleatorio para TOTP."""
        return pyotp.random_base32()
    
    def get_totp_uri(self, secret: str, user_email: str) -> str:
        """
        Genera la URI para el código QR.
        Esta URI se puede usar con apps como Google Authenticator, Authy, etc.
        """
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(
            name=user_email,
            issuer_name=self.issuer_name
        )
    
    def generate_qr_code(self, secret: str, user_email: str) -> str:
        """
        Genera un código QR como imagen base64.
        El usuario puede escanear este QR con su app de autenticación.
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
        Verifica si el código TOTP es válido.
        Permite una ventana de ±1 período (30 segundos) para compensar desfases de tiempo.
        """
        if not secret or not code:
            return False
        
        try:
            totp = pyotp.TOTP(secret)
            # valid_window=1 permite códigos del período anterior y siguiente
            return totp.verify(code, valid_window=1)
        except Exception:
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
        Genera códigos de respaldo para cuando el usuario no tenga acceso a su app.
        Cada código es de un solo uso.
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
        Hashea los códigos de respaldo y los retorna como JSON.
        Los códigos hasheados se guardarán en la BD.
        """
        hashed = [self.hasher.hash(code) for code in codes]
        return json.dumps(hashed)
    
    def verify_backup_code(self, backup_codes_json: Optional[str], code: str) -> bool:
        """
        Verifica si un código de respaldo es válido.
        Retorna True si el código coincide con alguno de los códigos hasheados.
        """
        if not backup_codes_json or not code:
            return False
        
        try:
            hashed_codes = json.loads(backup_codes_json)
            for hashed_code in hashed_codes:
                if self.hasher.verify(code, hashed_code):
                    return True
            return False
        except Exception:
            return False
    
    def remove_used_backup_code(self, backup_codes_json: str, used_code: str) -> str:
        """
        Elimina un código de respaldo usado de la lista.
        Retorna el JSON actualizado sin el código usado.
        """
        try:
            hashed_codes = json.loads(backup_codes_json)
            # Filtrar el código que coincide
            remaining_codes = [
                hashed_code for hashed_code in hashed_codes
                if not self.hasher.verify(used_code, hashed_code)
            ]
            return json.dumps(remaining_codes)
        except Exception:
            return backup_codes_json


