"""
Script de inicialización rápida para pruebas de integración.
Verifica requisitos y configura el entorno.
"""
import sys


def print_section(title: str):
    """Imprime una sección"""
    print(f"\n{'=' * 60}")
    print(f"{title}")
    print('=' * 60)


def check_python_version():
    """Verifica versión de Python"""
    version = sys.version_info
    required = (3, 10)
    
    if version >= required:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor} (se requiere >= 3.10)")
        return False


def check_dependencies():
    """Verifica dependencias necesarias"""
    dependencies = [
        ("pytest", "pytest"),
        ("pytest-asyncio", "pytest_asyncio"),
        ("httpx", "httpx"),
        ("sqlalchemy", "sqlalchemy"),
        ("redis", "redis"),
        ("fastapi", "fastapi"),
    ]
    
    print("\n📦 Checking dependencies:")
    all_ok = True
    
    for package_name, import_name in dependencies:
        try:
            __import__(import_name)
            print(f"  ✅ {package_name}")
        except ImportError:
            print(f"  ❌ {package_name} (not installed)")
            all_ok = False
    
    return all_ok


def check_services():
    """Verifica disponibilidad de servicios"""
    print("\n🔌 Checking services:")
    
    services_ok = True
    
    # Database
    try:
        from app.core.db.database import _db
        import asyncio
        from sqlalchemy import text
        
        async def check_db():
            engine = _db.get_engine()
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
                return True
        
        result = asyncio.run(check_db())
        if result:
            print("  ✅ PostgreSQL")
    except Exception as e:
        print(f"  ❌ PostgreSQL ({str(e)[:40]})")
        services_ok = False
    
    # Redis
    try:
        from app.core.cache.redis import _redis
        import asyncio
        
        async def check_redis():
            client = _redis.get_client()
            return await client.ping()
        
        result = asyncio.run(check_redis())
        if result:
            print("  ✅ Redis")
    except Exception as e:
        print(f"  ❌ Redis ({str(e)[:40]})")
        services_ok = False
    
    # Users API
    try:
        import httpx
        import asyncio
        from app.core.config.enviroment import _SETTINGS
        
        async def check_api():
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(
                    f"{_SETTINGS.users_api_url}/actuator/health"
                )
                return response.status_code == 200
        
        result = asyncio.run(check_api())
        if result:
            print("  ✅ Users API (Spring Boot)")
    except Exception as e:
        print(f"  ⚠️ Users API ({str(e)[:40]})")
        # No es crítico
    
    return services_ok


def show_help():
    """Muestra ayuda para ejecutar tests"""
    print("\n💡 Quick Start Commands:")
    print("\n  # Run all integration tests:")
    print("  python -m ci.integration_test")
    print("\n  # Run specific tests:")
    print("  python ci/integration_test/tests/run_tests.py --type database")
    print("  python ci/integration_test/tests/run_tests.py --type redis")
    print("  python ci/integration_test/tests/run_tests.py --type api")
    print("\n  # Quick tests only:")
    print("  python ci/integration_test/tests/run_tests.py --quick")
    print("\n  # With pytest directly:")
    print("  pytest ci/integration_test/ -v")


def main():
    """Función principal"""
    print_section("🧪 Integration Tests - Setup Check")
    
    # Check Python
    print_section("1️⃣ Python Version")
    python_ok = check_python_version()
    
    # Check dependencies
    print_section("2️⃣ Dependencies")
    deps_ok = check_dependencies()
    
    if not deps_ok:
        print("\n❌ Missing dependencies. Install with:")
        print("   pip install -r requirements.txt")
    
    # Check services
    print_section("3️⃣ External Services")
    services_ok = check_services()
    
    if not services_ok:
        print("\n⚠️ Some services are not available.")
        print("   Start with: docker-compose up -d")
    
    # Summary
    print_section("📊 Summary")
    
    if python_ok and deps_ok and services_ok:
        print("\n✅ All checks passed! Ready to run integration tests.")
        show_help()
        return 0
    elif python_ok and deps_ok:
        print("\n⚠️ Dependencies OK, but some services unavailable.")
        print("   Tests requiring those services will be skipped.")
        show_help()
        return 0
    else:
        print("\n❌ Setup incomplete. Fix issues above before running tests.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
