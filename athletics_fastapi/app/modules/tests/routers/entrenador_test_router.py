"""
Entrenador Test Router - No Rate Limiting
Reuses all main entrenador routers without rate limiting for testing.
"""
from fastapi import APIRouter

# Import main entrenador routers
from app.modules.entrenador.routers.v1.entrenamiento_router import router as entrenamiento_router
from app.modules.entrenador.routers.v1.horario_router import router as horario_router
from app.modules.entrenador.routers.v1.asistencia_router import router as asistencia_router
from app.modules.entrenador.routers.v1.resultado_entrenamiento_router import router as resultado_entrenamiento_router

router = APIRouter(prefix="/entrenador")

# Include all main routers - identical routes, no rate limiting in test environment
router.include_router(resultado_entrenamiento_router)
router.include_router(entrenamiento_router)
router.include_router(horario_router)
router.include_router(asistencia_router)


