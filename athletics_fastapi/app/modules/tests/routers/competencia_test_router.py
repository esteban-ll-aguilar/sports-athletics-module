"""
Competencia Test Router - No Rate Limiting
Reuses all main competencia routers without rate limiting for testing.
Includes: competencias, pruebas, resultados, baremos, tipo_disciplina, registros
"""
from fastapi import APIRouter

# Import all main routers from competencia module
from app.modules.competencia.routers.v1.competencia_router import router as competencia_router
from app.modules.competencia.routers.v1.resultado_competencia_router import router as resultado_competencia_router
from app.modules.competencia.routers.v1.baremo_router import router as baremo_router
from app.modules.competencia.routers.v1.tipo_disciplina_router import router as tipo_disciplina_router
from app.modules.competencia.routers.v1.prueba_router import router as prueba_router
from app.modules.competencia.routers.v1.registro_prueba_competencia_router import router as registro_prueba_competencia_router
from app.modules.competencia.routers.v1.registro_prueba_router import router as registro_prueba_router

router = APIRouter(prefix="/competencia")

# Include all main routers - identical routes, no rate limiting in test environment
router.include_router(
    competencia_router,
    prefix="/competencias"
)

router.include_router(
    resultado_competencia_router,
    prefix="/resultados"
)

router.include_router(
    baremo_router,
    prefix="/baremos"
)

router.include_router(
    tipo_disciplina_router,
    prefix="/tipo-disciplina"
)

router.include_router(
    prueba_router,
    prefix="/pruebas"
)

router.include_router(
    registro_prueba_competencia_router,
    prefix="/registro-pruebas"
)

router.include_router(
    registro_prueba_router,
    prefix="/resultados-pruebas"
)