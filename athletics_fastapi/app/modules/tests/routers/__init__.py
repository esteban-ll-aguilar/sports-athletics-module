"""Test routers without rate limiting"""
from fastapi import APIRouter

from .auth_test_router import router as auth_test_router
from .atleta_test_router import router as atleta_test_router
from .entrenador_test_router import router as entrenador_test_router
from .competencia_test_router import router as competencia_test_router
from .representante_test_router import router as representante_test_router
from .admin_test_router import router as admin_test_router

# Main test router
tests_router = APIRouter(prefix="/tests", tags=["Tests"])

# Include all test sub-routers
tests_router.include_router(auth_test_router)
tests_router.include_router(atleta_test_router)
tests_router.include_router(entrenador_test_router)
tests_router.include_router(competencia_test_router)
tests_router.include_router(representante_test_router)
tests_router.include_router(admin_test_router)

__all__ = ["tests_router"]
