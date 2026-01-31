import secrets
import string
from redis.asyncio import Redis
from app.core.cache.redis import _redis
from typing import Optional


class EmailVerificationService:
    """Servicio para gestionar códigos de verificación de email."""
    
    def __init__(self, redis_client: Redis = None):
        self.redis = redis_client if redis_client is not None else _redis.get_client()
        self.expiry_seconds = 900  # 15 minutos (más seguro para facturación)
        self.max_attempts = 5

    def generate_verification_code(self, length: int = 6) -> str:
        """
        Genera un código de verificación numérico aleatorio.
        
        Args:
           length (int): Longitud del código (por defecto 6).
           
        Returns:
           str: Código generado.
        """
        alphabet = string.digits  # Solo dígitos para códigos de email
        return "".join(secrets.choice(alphabet) for _ in range(length))

    async def store_verification_code(self, email: str, code: str) -> None:
        """
        Almacena un código de verificación en Redis asociado a un email.
        
        El código tiene un tiempo de expiración definido en self.expiry_seconds.
        Los intentos se inicializan en 0.
        
        Args:
            email (str): Email del usuario.
            code (str): Código a almacenar.
        """
        key = f"email_verification:{email.lower()}"
        data = {
            "code": code,
            "attempts": "0"
        }
        
        # Usar pipeline para operaciones atómicas
        pipe = self.redis.pipeline()
        pipe.hset(key, mapping=data)
        pipe.expire(key, self.expiry_seconds)
        await pipe.execute()

    async def validate_verification_code(self, email: str, code: str) -> bool:
        """
        Valida si el código proporcionado coincide con el almacenado para el email.
        
        Controla el número de intentos fallidos. Si se excede el máximo, el código se invalida.
        Si la validación es exitosa, el código se consume (se elimina).
        
        Args:
            email (str): Email a validar.
            code (str): Código proporcionado por el usuario.
            
        Returns:
            bool: True si el código es válido, False en caso contrario.
        """
        key = f"email_verification:{email.lower()}"
        
        # Obtener datos del código
        data = await self.redis.hgetall(key)
        if not data:
            return False
        
        stored_code = data.get("code")
        attempts = int(data.get("attempts", 0))
        
        # Verificar intentos máximos
        if attempts >= self.max_attempts:
            await self.redis.delete(key)
            return False
        
        # Incrementar intentos
        await self.redis.hincrby(key, "attempts", 1)
        
        # Verificar código
        if stored_code == code:
            await self.redis.delete(key)  # Consumir código
            return True
        
        return False

    async def delete_verification_code(self, email: str) -> None:
        """
        Elimina manualmente cualquier código de verificación activo para el email.
        
        Args:
            email (str): Email del usuario.
        """
        key = f"email_verification:{email.lower()}"
        await self.redis.delete(key)

    async def code_exists(self, email: str) -> bool:
        """
        Verifica si existe un código activo y no expirado para el email.
        
        Args:
            email (str): Email a consultar.
            
        Returns:
            bool: True si existe código.
        """
        key = f"email_verification:{email.lower()}"
        return await self.redis.exists(key) > 0

    async def get_remaining_time(self, email: str) -> Optional[int]:
        """
        Obtiene el tiempo restante de validez del código en segundos.
        
        Args:
            email (str): Email a consultar.
            
        Returns:
            Optional[int]: Segundos restantes o None si no hay código.
        """
        key = f"email_verification:{email.lower()}"
        ttl = await self.redis.ttl(key)
        return ttl if ttl > 0 else None
