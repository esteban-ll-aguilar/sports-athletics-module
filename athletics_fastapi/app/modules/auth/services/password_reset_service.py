import secrets
import string
from redis.asyncio import Redis
from app.core.cache.redis import _redis


class PasswordResetService:
    def __init__(self, redis_client: Redis = None):
        self.redis = redis_client if redis_client is not None else _redis.get_client()
        self.expiry_seconds = 300  # 5 minutos
        self.max_attempts = 3

    def generate_reset_code(self, length: int = 6) -> str:
        """
        Genera un código de restablecimiento aleatorio alfanumérico.
        
        Args:
           length (int): Longitud del código.
           
        Returns:
           str: Código generado.
        """
        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    async def store_reset_code(self, email: str, code: str) -> None:
        """
        Almacena un código de restablecimiento en Redis.
        
        El código expira después de self.expiry_seconds.
        
        Args:
            email (str): Email del usuario.
            code (str): Código a almacenar.
        """
        key = f"password_reset:{email}"
        data = {
            "code": code,
            "attempts": "0"
        }
        
        # Usar pipeline para operaciones atómicas
        pipe = self.redis.pipeline()
        pipe.hset(key, mapping=data)
        pipe.expire(key, self.expiry_seconds)
        await pipe.execute()

    async def validate_reset_code_only(self, email: str, code: str) -> bool:
        """
        Valida que el código sea correcto SIN consumirlo y SIN contar intentos.
        
        Útil para verificaciones intermedias donde no se quiere invalidar el código aún.
        
        Args:
            email (str): Email del usuario.
            code (str): Código a verificar.
            
        Returns:
            bool: True si coincide.
        """
        key = f"password_reset:{email}"
        
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
        
        # Verificar código sin incrementar intentos ni consumir
        return stored_code == code

    async def validate_reset_code(self, email: str, code: str) -> bool:
        """
        Valida un código de reset, incrementa intentos y lo consume si es correcto.
        
        Args:
            email (str): Email del usuario.
            code (str): Código a validar.
            
        Returns:
            bool: True si el código es válido.
        """
        key = f"password_reset:{email}"
        
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

    async def consume_reset_code(self, email: str, code: str) -> bool:
        """
        Verifica y consume un código de reset (similar a validate_reset_code).
        
        Diferencia semántica: esta función está explícitamente destinada a ser usada
        cuando el usuario efectivamente realiza la acción de resetear la contraseña.
        
        Args:
            email (str): Email del usuario.
            code (str): Código a consumir.
            
        Returns:
            bool: True si fue consumido exitosamente.
        """
        key = f"password_reset:{email}"
        
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
        
        # Verificar código y consumir si es válido
        if stored_code == code:
            await self.redis.delete(key)  # Consumir código
            return True
        
        # Incrementar intentos si el código es incorrecto
        await self.redis.hincrby(key, "attempts", 1)
        return False

    async def delete_reset_code(self, email: str) -> None:
        """
        Elimina el código de reset asociado a un email.
        
        Args:
            email (str): Email del usuario.
        """
        key = f"password_reset:{email}"
        await self.redis.delete(key)

    async def code_exists(self, email: str) -> bool:
        """
        Verifica si existe un código de reset activo para el email.
        
        Args:
            email (str): Email del usuario.
            
        Returns:
            bool: True si existe.
        """
        key = f"password_reset:{email}"
        return await self.redis.exists(key) > 0