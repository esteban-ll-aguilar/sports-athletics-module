import secrets
import string
from redis.asyncio import Redis
from app.core.cache.redis import _redis
from typing import Optional


class PasswordResetService:
    def __init__(self, redis_client: Redis = None):
        self.redis = redis_client if redis_client is not None else _redis.get_client()
        self.expiry_seconds = 300  # 5 minutos
        self.max_attempts = 3

    def generate_reset_code(self, length: int = 8) -> str:
        """Genera un código de reset aleatorio usando secrets (más seguro que random)."""
        alphabet = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    async def store_reset_code(self, email: str, code: str) -> None:
        """Almacena un código de reset en Redis con expiración de 5 minutos."""
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
        """Valida un código de reset sin consumirlo. Solo para verificación."""
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
        """Valida un código de reset. Retorna True si es válido."""
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
        """Consume un código de reset después de validación exitosa."""
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
        """Elimina un código de reset."""
        key = f"password_reset:{email}"
        await self.redis.delete(key)

    async def code_exists(self, email: str) -> bool:
        """Verifica si existe un código activo para el email."""
        key = f"password_reset:{email}"
        return await self.redis.exists(key) > 0