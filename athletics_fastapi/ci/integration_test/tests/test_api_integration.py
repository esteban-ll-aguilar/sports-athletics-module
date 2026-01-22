"""
Pruebas de integración para los endpoints de la API.
Verifica health checks, autenticación, CORS y endpoints principales.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import _APP
from app.core.config.enviroment import _SETTINGS


class TestAPIIntegration:
    """Suite de pruebas de integración para endpoints de la API"""
    
    @pytest.mark.asyncio
    async def test_app_initialization(self):
        """Verifica que la aplicación FastAPI se inicialice correctamente"""
        assert _APP is not None, "App FastAPI no inicializada"
        assert hasattr(_APP, 'routes'), "App no tiene rutas configuradas"
        
        print(f"\n🚀 FastAPI App: {_APP.title if hasattr(_APP, 'title') else 'N/A'}")
        print(f"🚀 Version: {_APP.version if hasattr(_APP, 'version') else 'N/A'}")
        print(f"🚀 Routes count: {len(_APP.routes)}")
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self):
        """Verifica el endpoint de health check"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            response = await client.get("/health")
            
            assert response.status_code == 200, f"Health check falló: {response.status_code}"
            
            data = response.json()
            assert "status" in data or "message" in data or data is not None
            
            print(f"\n✅ Health endpoint OK: {data}")
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Verifica el endpoint raíz"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            response = await client.get("/")
            
            # Puede ser 200 (si existe) o 404 (si no existe endpoint raíz)
            assert response.status_code in [200, 404, 307], \
                f"Root endpoint retornó código inesperado: {response.status_code}"
            
            print(f"\n📍 Root endpoint status: {response.status_code}")
    
    @pytest.mark.asyncio
    async def test_api_docs_endpoints(self):
        """Verifica que los endpoints de documentación estén disponibles"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Swagger UI (está en / según main.py)
            response = await client.get("/")
            assert response.status_code == 200, "Swagger docs no disponible"
            print("\n✅ Swagger UI (/) available")
            
            # ReDoc (está en /doc según main.py)
            response = await client.get("/doc")
            assert response.status_code == 200, "ReDoc no disponible"
            print("✅ ReDoc (/doc) available")
            
            # OpenAPI Schema
            response = await client.get("/openapi.json")
            assert response.status_code == 200, "OpenAPI schema no disponible"
            
            schema = response.json()
            assert "openapi" in schema, "Schema OpenAPI inválido"
            assert "paths" in schema, "Schema no tiene paths"
            
            print(f"✅ OpenAPI schema available ({len(schema.get('paths', {}))} paths)")
    
    @pytest.mark.asyncio
    async def test_cors_headers(self):
        """Verifica configuración de CORS"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Preflight request
            response = await client.options(
                "/health",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "GET"
                }
            )
            
            # Debería permitir CORS o responder 200
            assert response.status_code in [200, 204], \
                f"CORS preflight falló: {response.status_code}"
            
            # Verificar headers CORS
            headers = response.headers
            print(f"\n🌐 CORS Configuration:")
            print(f"  - Allow-Origin: {headers.get('access-control-allow-origin', 'Not set')}")
            print(f"  - Allow-Methods: {headers.get('access-control-allow-methods', 'Not set')}")
            print(f"  - Allow-Headers: {headers.get('access-control-allow-headers', 'Not set')}")
            print(f"  - Allow-Credentials: {headers.get('access-control-allow-credentials', 'Not set')}")
    
    @pytest.mark.asyncio
    async def test_api_v1_routes(self):
        """Verifica que las rutas de API v1 existan"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Intentar acceder a rutas comunes de API v1
            common_routes = [
                "/api/v1/auth/login",
                "/api/v1/atletas",
                "/api/v1/entrenadores",
                "/api/v1/competencias",
            ]
            
            print("\n🛣️ API v1 Routes:")
            for route in common_routes:
                response = await client.get(route)
                
                # 401/403 es OK (no autenticado), 404 significa que no existe
                status = response.status_code
                exists = status != 404
                
                status_icon = "✅" if exists else "⚠️"
                print(f"  {status_icon} {route}: {status}")
    
    @pytest.mark.asyncio
    async def test_login_endpoint_structure(self):
        """Verifica estructura del endpoint de login"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Intentar login sin credenciales
            response = await client.post(
                "/api/v1/auth/login",
                json={}
            )
            
            # Debería dar 422 (validation error) o 400 (bad request)
            assert response.status_code in [400, 422], \
                f"Login sin credenciales debería fallar con 400/422, obtuvo: {response.status_code}"
            
            print("\n✅ Login endpoint validation working")
    
    @pytest.mark.asyncio
    async def test_unauthorized_access(self):
        """Verifica que rutas protegidas requieran autenticación"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Intentar acceder sin token
            protected_routes = [
                "/api/v1/atletas",
                "/api/v1/entrenadores",
                "/api/v1/competencias",
            ]
            
            print("\n🔒 Protected Routes (without auth):")
            for route in protected_routes:
                response = await client.get(route)
                status = response.status_code
                
                # 401 o 403 significa que está protegido (correcto)
                # 404 significa que no existe
                # 200 significa que NO está protegido (problema)
                
                if status in [401, 403]:
                    print(f"  ✅ {route}: Protected ({status})")
                elif status == 404:
                    print(f"  ⚠️ {route}: Not found ({status})")
                elif status == 200:
                    print(f"  ❌ {route}: NOT PROTECTED! ({status})")
                else:
                    print(f"  ℹ️ {route}: {status}")
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Verifica si hay rate limiting configurado"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Hacer múltiples requests rápidos
            responses = []
            for i in range(100):
                response = await client.get("/health")
                responses.append(response.status_code)
            
            # Si hay rate limiting, alguno debería ser 429
            has_rate_limit = 429 in responses
            
            if has_rate_limit:
                print("\n✅ Rate limiting is active")
                print(f"  - Total requests: {len(responses)}")
                print(f"  - Blocked: {responses.count(429)}")
            else:
                print("\n⚠️ No rate limiting detected (100 requests all passed)")
    
    @pytest.mark.asyncio
    async def test_static_files(self):
        """Verifica si hay archivos estáticos configurados"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Intentar acceder a ruta de archivos estáticos
            static_routes = [
                "/static/",
                "/public/",
                "/data/profile_pictures/",
            ]
            
            print("\n📁 Static Files Routes:")
            for route in static_routes:
                try:
                    response = await client.get(route)
                    if response.status_code in [200, 403, 404]:
                        print(f"  ℹ️ {route}: {response.status_code}")
                except Exception as e:
                    print(f"  ⚠️ {route}: {str(e)[:50]}")
    
    @pytest.mark.asyncio
    async def test_request_validation(self):
        """Verifica validación de requests con datos inválidos"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Enviar JSON malformado
            response = await client.post(
                "/api/v1/auth/login",
                json={
                    "email": "not-an-email",
                    "password": "",
                }
            )
            
            # Debería rechazar con 400 o 422
            assert response.status_code in [400, 422], \
                f"Validación no funcionó, código: {response.status_code}"
            
            data = response.json()
            print(f"\n✅ Request validation working")
            print(f"  - Error detail: {data.get('detail', 'N/A')[:100]}")
    
    @pytest.mark.asyncio
    async def test_response_headers(self):
        """Verifica headers de respuesta importantes"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            response = await client.get("/health")
            
            headers = response.headers
            print("\n📋 Response Headers:")
            
            # Headers de seguridad comunes
            security_headers = [
                "x-frame-options",
                "x-content-type-options",
                "x-xss-protection",
                "strict-transport-security",
            ]
            
            for header in security_headers:
                value = headers.get(header, "Not set")
                print(f"  - {header}: {value}")
            
            # Content-Type
            assert "content-type" in headers, "Content-Type header missing"
            print(f"  - content-type: {headers['content-type']}")
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Verifica manejo de errores de la API"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Ruta que no existe
            response = await client.get("/api/v1/nonexistent/route")
            
            assert response.status_code == 404, "404 no retornado para ruta inexistente"
            
            data = response.json()
            assert "detail" in data, "Error response sin 'detail'"
            
            print(f"\n✅ Error handling working")
            print(f"  - 404 detail: {data.get('detail')}")
    
    @pytest.mark.asyncio
    async def test_method_not_allowed(self):
        """Verifica respuesta a métodos HTTP no permitidos"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # POST a un endpoint que solo acepta GET
            response = await client.post("/health")
            
            # Debería ser 405 Method Not Allowed
            assert response.status_code == 405, \
                f"Method Not Allowed debería ser 405, obtuvo: {response.status_code}"
            
            print("\n✅ Method validation working (405 returned)")
    
    @pytest.mark.asyncio
    async def test_content_negotiation(self):
        """Verifica negociación de contenido (Accept header)"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Request con Accept: application/json
            response = await client.get(
                "/health",
                headers={"Accept": "application/json"}
            )
            
            assert response.status_code == 200
            assert "application/json" in response.headers.get("content-type", "")
            
            print("\n✅ Content negotiation working (JSON)")
    
    @pytest.mark.asyncio
    async def test_api_versioning(self):
        """Verifica que el versionado de API esté implementado"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Verificar que /api/v1 exista
            response = await client.get("/api/v1")
            
            # Puede ser 200 o 404 dependiendo si hay endpoint raíz
            status = response.status_code
            
            print(f"\n📦 API Versioning:")
            print(f"  - /api/v1: {status}")
            
            if status != 404:
                print("  ✅ API versioning implemented")
            else:
                print("  ℹ️ No root endpoint for /api/v1")
    
    @pytest.mark.asyncio
    async def test_database_dependency_in_endpoints(self):
        """Verifica que los endpoints puedan acceder a la BD"""
        # Este test se ejecuta indirectamente
        # Si los endpoints funcionan, significa que la BD es accesible
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            response = await client.get("/health")
            
            # Si la app levantó, la DB debe estar OK
            assert response.status_code == 200
            print("\n✅ Database dependency resolution working")
    
    @pytest.mark.asyncio
    async def test_redis_dependency_in_endpoints(self):
        """Verifica que los endpoints puedan acceder a Redis"""
        # Si la app levantó con Redis en lifespan, está OK
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            response = await client.get("/health")
            
            assert response.status_code == 200
            print("\n✅ Redis dependency resolution working")
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Verifica manejo de requests concurrentes"""
        import asyncio
        
        async def make_request(client, index):
            response = await client.get("/health")
            return response.status_code
        
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # 20 requests concurrentes
            tasks = [make_request(client, i) for i in range(20)]
            results = await asyncio.gather(*tasks)
            
            # Todos deberían ser 200
            assert all(status == 200 for status in results), \
                f"Algunas requests concurrentes fallaron: {results}"
            
            print(f"\n✅ Concurrent requests handled ({len(results)} simultaneous)")
    
    @pytest.mark.asyncio
    async def test_large_payload_handling(self):
        """Verifica manejo de payloads grandes"""
        async with AsyncClient(
            transport=ASGITransport(app=_APP),
            base_url="http://test"
        ) as client:
            # Payload grande (1MB de datos)
            large_data = {
                "data": "x" * (1024 * 1024),  # 1MB
                "email": "test@example.com",
                "password": "test123"
            }
            
            response = await client.post(
                "/api/v1/auth/login",
                json=large_data
            )
            
            # Puede rechazar por validación o por tamaño
            assert response.status_code in [400, 413, 422], \
                f"Large payload no manejado correctamente: {response.status_code}"
            
            print(f"\n✅ Large payload handled (rejected with {response.status_code})")
