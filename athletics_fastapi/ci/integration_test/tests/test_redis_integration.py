"""
Pruebas de integración para Redis.
Verifica conexión, operaciones CRUD, TTL, caché y funcionalidades avanzadas.
"""
import pytest
import asyncio
import json
from datetime import datetime, timedelta
from app.core.cache.redis import _redis
from app.core.config.enviroment import _SETTINGS


class TestRedisIntegration:
    """Suite de pruebas de integración para Redis"""
    
    @pytest.mark.asyncio
    async def test_redis_connection(self):
        """Verifica que la conexión a Redis funcione correctamente"""
        redis_client = _redis.get_client()
        
        # Ping a Redis
        pong = await redis_client.ping()
        assert pong is True, "Redis no responde al ping"
        print("\n✅ Redis connection successful")
    
    @pytest.mark.asyncio
    async def test_redis_configuration(self):
        """Verifica la configuración de Redis"""
        assert _SETTINGS.redis_url, "REDIS_URL no está configurado"
        assert "redis://" in _SETTINGS.redis_url, "URL de Redis incorrecta"
        print(f"\n🔗 Redis URL configured: {_SETTINGS.redis_url}")
    
    @pytest.mark.asyncio
    async def test_redis_info(self):
        """Obtiene información del servidor Redis"""
        redis_client = _redis.get_client()
        
        info = await redis_client.info()
        assert info is not None, "No se pudo obtener info de Redis"
        
        print(f"\n📊 Redis Version: {info.get('redis_version', 'N/A')}")
        print(f"📊 Redis Mode: {info.get('redis_mode', 'N/A')}")
        print(f"📊 Connected Clients: {info.get('connected_clients', 'N/A')}")
        print(f"📊 Used Memory: {info.get('used_memory_human', 'N/A')}")
    
    @pytest.mark.asyncio
    async def test_redis_set_get(self):
        """Verifica operaciones básicas SET y GET"""
        redis_client = _redis.get_client()
        
        # SET
        key = "test:integration:set_get"
        value = "test_value_123"
        
        await redis_client.set(key, value)
        
        # GET
        retrieved = await redis_client.get(key)
        assert retrieved == value, f"Valor esperado: {value}, obtenido: {retrieved}"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ SET/GET operations working")
    
    @pytest.mark.asyncio
    async def test_redis_ttl(self):
        """Verifica que el TTL (Time To Live) funcione"""
        redis_client = _redis.get_client()
        
        key = "test:integration:ttl"
        value = "expires_soon"
        ttl_seconds = 2
        
        # SET con TTL
        await redis_client.setex(key, ttl_seconds, value)
        
        # Verificar que existe
        exists = await redis_client.exists(key)
        assert exists == 1, "La clave debería existir"
        
        # Verificar TTL
        ttl = await redis_client.ttl(key)
        assert ttl > 0 and ttl <= ttl_seconds, f"TTL incorrecto: {ttl}"
        
        # Esperar a que expire
        await asyncio.sleep(ttl_seconds + 0.5)
        
        # Verificar que expiró
        exists = await redis_client.exists(key)
        assert exists == 0, "La clave debería haber expirado"
        
        print(f"\n✅ TTL working correctly (expired after {ttl_seconds}s)")
    
    @pytest.mark.asyncio
    async def test_redis_increment_decrement(self):
        """Verifica operaciones de incremento y decremento"""
        redis_client = _redis.get_client()
        
        key = "test:integration:counter"
        
        # Limpiar si existe
        await redis_client.delete(key)
        
        # INCR
        value = await redis_client.incr(key)
        assert value == 1, f"Primer INCR debería ser 1, obtenido: {value}"
        
        # INCR múltiples veces
        await redis_client.incr(key)
        await redis_client.incr(key)
        value = await redis_client.get(key)
        assert value == "3", f"Valor después de 3 INCR debería ser 3, obtenido: {value}"
        
        # DECR
        await redis_client.decr(key)
        value = await redis_client.get(key)
        assert value == "2", f"Valor después de DECR debería ser 2, obtenido: {value}"
        
        # INCRBY
        await redis_client.incrby(key, 10)
        value = await redis_client.get(key)
        assert value == "12", f"Valor después de INCRBY 10 debería ser 12, obtenido: {value}"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ INCR/DECR operations working")
    
    @pytest.mark.asyncio
    async def test_redis_hash_operations(self):
        """Verifica operaciones con hashes (HSET, HGET, HGETALL)"""
        redis_client = _redis.get_client()
        
        key = "test:integration:hash"
        
        # HSET múltiples campos
        await redis_client.hset(key, mapping={
            "field1": "value1",
            "field2": "value2",
            "field3": "value3"
        })
        
        # HGET un campo
        value = await redis_client.hget(key, "field1")
        assert value == "value1", f"HGET falló, obtenido: {value}"
        
        # HGETALL
        all_fields = await redis_client.hgetall(key)
        assert len(all_fields) == 3, f"Deberían haber 3 campos, obtenidos: {len(all_fields)}"
        assert all_fields["field2"] == "value2", "Campo field2 incorrecto"
        
        # HDEL
        await redis_client.hdel(key, "field1")
        exists = await redis_client.hexists(key, "field1")
        assert exists == 0, "field1 debería haber sido eliminado"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ Hash operations working")
    
    @pytest.mark.asyncio
    async def test_redis_list_operations(self):
        """Verifica operaciones con listas (LPUSH, RPUSH, LRANGE)"""
        redis_client = _redis.get_client()
        
        key = "test:integration:list"
        
        # Limpiar si existe
        await redis_client.delete(key)
        
        # LPUSH (push a la izquierda)
        await redis_client.lpush(key, "item1")
        await redis_client.lpush(key, "item2")
        
        # RPUSH (push a la derecha)
        await redis_client.rpush(key, "item3")
        
        # LRANGE (obtener todos los elementos)
        items = await redis_client.lrange(key, 0, -1)
        assert len(items) == 3, f"Debería haber 3 items, obtenidos: {len(items)}"
        assert items[0] == "item2", "Primer item incorrecto"
        assert items[2] == "item3", "Último item incorrecto"
        
        # LLEN (longitud de la lista)
        length = await redis_client.llen(key)
        assert length == 3, f"Longitud debería ser 3, obtenida: {length}"
        
        # LPOP
        popped = await redis_client.lpop(key)
        assert popped == "item2", f"LPOP debería devolver item2, obtenido: {popped}"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ List operations working")
    
    @pytest.mark.asyncio
    async def test_redis_set_operations(self):
        """Verifica operaciones con sets (SADD, SMEMBERS, SISMEMBER)"""
        redis_client = _redis.get_client()
        
        key = "test:integration:set"
        
        # Limpiar si existe
        await redis_client.delete(key)
        
        # SADD (agregar miembros)
        await redis_client.sadd(key, "member1", "member2", "member3")
        
        # SMEMBERS (obtener todos los miembros)
        members = await redis_client.smembers(key)
        assert len(members) == 3, f"Debería haber 3 miembros, obtenidos: {len(members)}"
        
        # SISMEMBER (verificar si es miembro)
        is_member = await redis_client.sismember(key, "member1")
        assert is_member == 1, "member1 debería ser miembro del set"
        
        is_member = await redis_client.sismember(key, "member999")
        assert is_member == 0, "member999 no debería ser miembro del set"
        
        # SCARD (cardinalidad/tamaño del set)
        size = await redis_client.scard(key)
        assert size == 3, f"Tamaño debería ser 3, obtenido: {size}"
        
        # SREM (remover miembro)
        await redis_client.srem(key, "member2")
        size = await redis_client.scard(key)
        assert size == 2, "Debería quedar 2 miembros después de SREM"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ Set operations working")
    
    @pytest.mark.asyncio
    async def test_redis_json_cache(self):
        """Verifica almacenamiento de objetos JSON complejos"""
        redis_client = _redis.get_client()
        
        key = "test:integration:json"
        
        # Objeto Python complejo
        data = {
            "user_id": 12345,
            "name": "Test User",
            "email": "test@example.com",
            "roles": ["admin", "user"],
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "active": True,
                "score": 98.5
            }
        }
        
        # Serializar y almacenar
        json_data = json.dumps(data)
        await redis_client.set(key, json_data, ex=60)
        
        # Recuperar y deserializar
        retrieved = await redis_client.get(key)
        retrieved_data = json.loads(retrieved)
        
        assert retrieved_data["user_id"] == data["user_id"]
        assert retrieved_data["name"] == data["name"]
        assert len(retrieved_data["roles"]) == 2
        assert retrieved_data["metadata"]["active"] is True
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ JSON caching working")
    
    @pytest.mark.asyncio
    async def test_redis_pipeline(self):
        """Verifica operaciones en pipeline (batch)"""
        redis_client = _redis.get_client()
        
        # Pipeline permite ejecutar múltiples comandos en lote
        pipe = redis_client.pipeline()
        
        keys = [f"test:pipeline:{i}" for i in range(5)]
        
        # Agregar comandos al pipeline
        for i, key in enumerate(keys):
            pipe.set(key, f"value_{i}")
        
        # Ejecutar todos los comandos
        results = await pipe.execute()
        assert len(results) == 5, "Pipeline debería devolver 5 resultados"
        
        # Verificar que se guardaron
        for key in keys:
            value = await redis_client.get(key)
            assert value is not None, f"Clave {key} no encontrada"
        
        # Cleanup en pipeline
        pipe = redis_client.pipeline()
        for key in keys:
            pipe.delete(key)
        await pipe.execute()
        
        print("\n✅ Pipeline operations working")
    
    @pytest.mark.asyncio
    async def test_redis_multiple_databases(self):
        """Verifica acceso a diferentes bases de datos Redis"""
        # Redis soporta múltiples DBs (0-15 por defecto)
        redis_client = _redis.get_client()
        
        # Obtener DB actual
        current_db = redis_client.connection_pool.connection_kwargs.get('db', 0)
        print(f"\n📊 Current Redis DB: {current_db}")
        
        # Operación en la DB actual
        key = f"test:db:{current_db}"
        await redis_client.set(key, "value_in_current_db")
        value = await redis_client.get(key)
        assert value == "value_in_current_db"
        
        # Cleanup
        await redis_client.delete(key)
        print(f"✅ Database {current_db} operations working")
    
    @pytest.mark.asyncio
    async def test_redis_pattern_matching(self):
        """Verifica búsqueda de claves por patrón (KEYS)"""
        redis_client = _redis.get_client()
        
        # Crear claves con patrón
        prefix = "test:pattern"
        keys_to_create = [
            f"{prefix}:user:1",
            f"{prefix}:user:2",
            f"{prefix}:session:abc",
            f"{prefix}:session:xyz",
        ]
        
        for key in keys_to_create:
            await redis_client.set(key, "value")
        
        # Buscar por patrón
        user_keys = await redis_client.keys(f"{prefix}:user:*")
        assert len(user_keys) >= 2, f"Deberían encontrarse al menos 2 user keys, encontradas: {len(user_keys)}"
        
        session_keys = await redis_client.keys(f"{prefix}:session:*")
        assert len(session_keys) >= 2, f"Deberían encontrarse al menos 2 session keys, encontradas: {len(session_keys)}"
        
        all_keys = await redis_client.keys(f"{prefix}:*")
        assert len(all_keys) >= 4, f"Deberían encontrarse al menos 4 keys totales, encontradas: {len(all_keys)}"
        
        # Cleanup
        for key in keys_to_create:
            await redis_client.delete(key)
        
        print("\n✅ Pattern matching working")
    
    @pytest.mark.asyncio
    async def test_redis_expire_persist(self):
        """Verifica operaciones EXPIRE y PERSIST"""
        redis_client = _redis.get_client()
        
        key = "test:integration:expire"
        
        # Crear clave sin expiración
        await redis_client.set(key, "value")
        
        # Verificar que no tiene TTL
        ttl = await redis_client.ttl(key)
        assert ttl == -1, "Clave nueva no debería tener TTL"
        
        # Establecer expiración de 5 segundos
        await redis_client.expire(key, 5)
        ttl = await redis_client.ttl(key)
        assert ttl > 0 and ttl <= 5, f"TTL debería estar entre 1-5, obtenido: {ttl}"
        
        # Hacer PERSIST (quitar expiración)
        await redis_client.persist(key)
        ttl = await redis_client.ttl(key)
        assert ttl == -1, "Después de PERSIST, no debería tener TTL"
        
        # Cleanup
        await redis_client.delete(key)
        print("\n✅ EXPIRE/PERSIST operations working")
    
    @pytest.mark.asyncio
    async def test_redis_concurrent_operations(self):
        """Verifica operaciones concurrentes"""
        redis_client = _redis.get_client()
        
        async def set_value(index: int):
            key = f"test:concurrent:{index}"
            await redis_client.set(key, f"value_{index}")
            return await redis_client.get(key)
        
        # Ejecutar 10 operaciones concurrentes
        tasks = [set_value(i) for i in range(10)]
        results = await asyncio.gather(*tasks)
        
        assert len(results) == 10, f"Deberían ser 10 resultados, obtenidos: {len(results)}"
        
        for i, result in enumerate(results):
            assert result == f"value_{i}", f"Resultado {i} incorrecto: {result}"
        
        # Cleanup
        pipe = redis_client.pipeline()
        for i in range(10):
            pipe.delete(f"test:concurrent:{i}")
        await pipe.execute()
        
        print("\n✅ Concurrent operations working (10 simultaneous)")
    
    @pytest.mark.asyncio
    async def test_redis_memory_usage(self):
        """Verifica el uso de memoria de una clave"""
        redis_client = _redis.get_client()
        
        key = "test:integration:memory"
        value = "x" * 1000  # 1000 caracteres
        
        await redis_client.set(key, value)
        
        # MEMORY USAGE (disponible en Redis 4.0+)
        try:
            memory = await redis_client.memory_usage(key)
            if memory:
                print(f"\n📊 Memory usage for key: {memory} bytes")
        except Exception:
            print("\n⚠️ MEMORY USAGE command not supported in this Redis version")
        
        # Cleanup
        await redis_client.delete(key)
    
    @pytest.mark.asyncio
    async def test_redis_client_list(self):
        """Verifica la lista de clientes conectados"""
        redis_client = _redis.get_client()
        
        # CLIENT LIST
        try:
            client_list = await redis_client.client_list()
            print(f"\n👥 Connected clients: {len(client_list)}")
            if client_list:
                print(f"First client info: {client_list[0]}")
        except Exception as e:
            print(f"\n⚠️ Could not get client list: {e}")
    
    @pytest.mark.asyncio
    async def test_redis_exists_multiple(self):
        """Verifica EXISTS con múltiples claves"""
        redis_client = _redis.get_client()
        
        keys = ["test:exists:1", "test:exists:2", "test:exists:3"]
        
        # Crear algunas claves
        await redis_client.set(keys[0], "value1")
        await redis_client.set(keys[2], "value3")
        
        # EXISTS devuelve cuántas de las claves existen
        count = await redis_client.exists(*keys)
        assert count == 2, f"Deberían existir 2 claves, encontradas: {count}"
        
        # Cleanup
        await redis_client.delete(*keys)
        print("\n✅ EXISTS with multiple keys working")
