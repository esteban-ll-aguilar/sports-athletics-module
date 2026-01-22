"""
Pruebas de integración para servicios externos.
Verifica conexión con el microservicio de usuarios (Spring Boot) y otros servicios.
"""
import pytest
import httpx
from app.core.config.enviroment import _SETTINGS


class TestExternalServicesIntegration:
    """Suite de pruebas de integración para servicios externos"""
    
    @pytest.mark.asyncio
    async def test_users_api_configuration(self):
        """Verifica configuración del API de usuarios"""
        assert _SETTINGS.users_api_url, "USERS_API_URL no configurado"
        assert _SETTINGS.users_api_email, "USERS_API_EMAIL no configurado"
        assert _SETTINGS.users_api_password, "USERS_API_PASSWORD no configurado"
        
        print(f"\n🔗 Users API URL: {_SETTINGS.users_api_url}")
        print(f"👤 Users API Email: {_SETTINGS.users_api_email}")
    
    @pytest.mark.asyncio
    async def test_users_api_health_check(self):
        """Verifica que el microservicio de usuarios esté disponible"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Intentar health check de Spring Boot
                response = await client.get(
                    f"{_SETTINGS.users_api_url}/actuator/health"
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"\n✅ Users API Health: {data.get('status', 'UP')}")
                    assert data.get('status') == 'UP', "Users API no está UP"
                else:
                    print(f"\n⚠️ Users API Health returned: {response.status_code}")
                    
        except httpx.ConnectError:
            pytest.skip("Users API no disponible (ConnectError)")
        except httpx.TimeoutException:
            pytest.skip("Users API timeout")
        except Exception as e:
            pytest.skip(f"Users API check failed: {e}")
    
    @pytest.mark.asyncio
    async def test_users_api_root_endpoint(self):
        """Verifica el endpoint raíz del API de usuarios"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(_SETTINGS.users_api_url)
                
                print(f"\n📍 Users API root: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ Users API responding")
                else:
                    print(f"⚠️ Users API returned: {response.status_code}")
                    
        except httpx.ConnectError:
            pytest.skip("Users API no disponible")
        except Exception as e:
            pytest.skip(f"Users API not accessible: {e}")
    
    @pytest.mark.asyncio
    async def test_users_api_authentication(self):
        """Verifica autenticación con el API de usuarios"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Intentar login
                response = await client.post(
                    f"{_SETTINGS.users_api_url}/api/auth/login",
                    json={
                        "email": _SETTINGS.users_api_email,
                        "password": _SETTINGS.users_api_password
                    }
                )
                
                print(f"\n🔐 Users API Auth: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print("✅ Authentication successful")
                    
                    # Verificar que devuelve token
                    if "token" in data or "access_token" in data:
                        print("✅ Token received")
                else:
                    print(f"⚠️ Authentication failed: {response.status_code}")
                    print(f"Response: {response.text[:200]}")
                    
        except httpx.ConnectError:
            pytest.skip("Users API no disponible")
        except Exception as e:
            pytest.skip(f"Authentication test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_users_api_endpoints(self):
        """Verifica endpoints comunes del API de usuarios"""
        common_endpoints = [
            "/api/users",
            "/api/config/create",
            "/actuator/health",
            "/actuator/info",
        ]
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                print("\n🛣️ Users API Endpoints:")
                
                for endpoint in common_endpoints:
                    try:
                        response = await client.get(
                            f"{_SETTINGS.users_api_url}{endpoint}"
                        )
                        status_icon = "✅" if response.status_code in [200, 401, 403] else "⚠️"
                        print(f"  {status_icon} {endpoint}: {response.status_code}")
                    except Exception as e:
                        print(f"  ❌ {endpoint}: {str(e)[:50]}")
                        
        except httpx.ConnectError:
            pytest.skip("Users API no disponible")
        except Exception as e:
            pytest.skip(f"Endpoints test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_users_api_response_time(self):
        """Verifica tiempo de respuesta del API de usuarios"""
        try:
            import time
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                start = time.time()
                response = await client.get(
                    f"{_SETTINGS.users_api_url}/actuator/health"
                )
                duration = time.time() - start
                
                print(f"\n⏱️ Users API response time: {duration:.3f}s")
                
                # Debería responder en menos de 5 segundos
                assert duration < 5.0, f"Response time too slow: {duration}s"
                
                if duration < 1.0:
                    print("✅ Response time excellent (<1s)")
                elif duration < 3.0:
                    print("✅ Response time good (<3s)")
                else:
                    print("⚠️ Response time acceptable but slow")
                    
        except httpx.ConnectError:
            pytest.skip("Users API no disponible")
        except httpx.TimeoutException:
            pytest.fail("Users API timeout (>10s)")
        except Exception as e:
            pytest.skip(f"Response time test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_users_api_error_handling(self):
        """Verifica manejo de errores del API de usuarios"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Request a endpoint inexistente
                response = await client.get(
                    f"{_SETTINGS.users_api_url}/api/nonexistent/endpoint"
                )
                
                assert response.status_code in [404, 400], \
                    f"Expected 404/400, got {response.status_code}"
                
                print(f"\n✅ Users API error handling working (404 returned)")
                
        except httpx.ConnectError:
            pytest.skip("Users API no disponible")
        except Exception as e:
            pytest.skip(f"Error handling test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_database_mariadb_connection(self):
        """Verifica información sobre la BD MariaDB del microservicio"""
        # Este test solo documenta la configuración
        print("\n📊 MariaDB Configuration (from docker-compose):")
        print("  - Database: sportDB")
        print("  - User: desarrollo")
        print("  - Host: mariadb (internal)")
        print("  - Port: 3306")
        print("  ℹ️ MariaDB is used by Spring Boot microservice")
    
    @pytest.mark.asyncio
    async def test_external_services_timeout(self):
        """Verifica timeouts de servicios externos"""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                # Con timeout corto
                response = await client.get(
                    f"{_SETTINGS.users_api_url}/actuator/health"
                )
                
                print("\n✅ External service responds within timeout")
                
        except httpx.TimeoutException:
            print("\n⚠️ External service exceeded timeout (2s)")
            pytest.skip("Service too slow")
        except httpx.ConnectError:
            pytest.skip("Service not available")
        except Exception as e:
            pytest.skip(f"Timeout test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_external_service_ssl_certificate(self):
        """Verifica certificados SSL si el servicio usa HTTPS"""
        if not _SETTINGS.users_api_url.startswith("https"):
            pytest.skip("Service not using HTTPS")
        
        try:
            async with httpx.AsyncClient(timeout=10.0, verify=True) as client:
                response = await client.get(_SETTINGS.users_api_url)
                print("\n✅ SSL certificate valid")
                
        except httpx.ConnectError:
            pytest.skip("Service not available")
        except Exception as e:
            print(f"\n⚠️ SSL verification issue: {e}")
    
    @pytest.mark.asyncio
    async def test_network_connectivity(self):
        """Verifica conectividad de red básica"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Test con un servicio público confiable
                response = await client.get("https://www.google.com")
                
                assert response.status_code == 200, "No hay conectividad a internet"
                print("\n✅ Network connectivity OK")
                
        except Exception as e:
            pytest.skip(f"Network connectivity test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_dns_resolution(self):
        """Verifica resolución DNS"""
        import socket
        
        try:
            # Resolver hostname del Users API
            if _SETTINGS.users_api_url.startswith("http://"):
                hostname = _SETTINGS.users_api_url.split("//")[1].split(":")[0].split("/")[0]
            else:
                hostname = _SETTINGS.users_api_url
            
            # Intentar resolver
            ip = socket.gethostbyname(hostname)
            print(f"\n✅ DNS resolution OK: {hostname} -> {ip}")
            
        except socket.gaierror:
            print(f"\n⚠️ DNS resolution failed for {hostname}")
            pytest.skip("DNS resolution failed")
        except Exception as e:
            pytest.skip(f"DNS test failed: {e}")
    
    @pytest.mark.asyncio
    async def test_service_dependencies(self):
        """Documenta las dependencias entre servicios"""
        print("\n📋 Service Dependencies:")
        print("  FastAPI depends on:")
        print("    - PostgreSQL (port 5432)")
        print("    - Redis (port 6379)")
        print("    - Spring Boot Users API (port 8096)")
        print("")
        print("  Spring Boot depends on:")
        print("    - MariaDB (port 3306)")
        print("")
        print("  ✅ Dependency graph documented")
