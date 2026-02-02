"""
Representante Test Router - No Rate Limiting
Reuses all main representante routers without rate limiting for testing.
"""
from fastapi import APIRouter

# Import main representante router
from app.modules.representante.routers.v1.representante_router import representante_router

router = APIRouter(prefix="/representante")

# Include main router - identical routes, no rate limiting in test environment
router.include_router(representante_router)
