"""
Admin Test Router - No Rate Limiting
Reuses all main admin routers without rate limiting for testing.
"""
from fastapi import APIRouter

# Import main admin router
from app.modules.admin.routers.v1.admin_routes import admin_router

router = APIRouter(prefix="/admin")

# Include main router - identical routes, no rate limiting in test environment
router.include_router(admin_router)
