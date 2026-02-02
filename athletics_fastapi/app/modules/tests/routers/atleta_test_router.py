"""
Atleta Test Router - No Rate Limiting
Reuses all main atleta routers without rate limiting for testing.
"""
from fastapi import APIRouter

# Import main atleta routers
from app.modules.atleta.routers.v1.atleta_router import router as atleta_router
from app.modules.atleta.routers.v1.historial_medico_router import router as historial_router

router = APIRouter(prefix="/atleta")

# Include all main routers - identical routes, no rate limiting in test environment
router.include_router(atleta_router)

router.include_router(
    historial_router,
    prefix="/historial-medico"
)
