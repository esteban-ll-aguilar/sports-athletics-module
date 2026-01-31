from app.main import app
from app.core.db.database import session_manager
import asyncio
from fast_auth.auth_config import FastAuthConfig

# Mock the session manager init to avoid DB connection errors during simple route check
async def mock_init():
    pass

session_manager.init = mock_init

print("Listing all registered routes:")
print("-" * 50)
for route in app.routes:
    if hasattr(route, "path"):
        methods = ", ".join(route.methods) if hasattr(route, "methods") else "ANY"
        print(f"{methods} {route.path}")
print("-" * 50)
