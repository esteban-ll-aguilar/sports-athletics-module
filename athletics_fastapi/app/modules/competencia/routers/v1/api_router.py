"""
Router Maestro del Módulo de Competencias.

Este archivo orquesta todos los sub-recursos deportivos, permitiendo una 
navegación estructurada desde la disciplina general hasta el resultado específico.
"""
from fastapi import APIRouter

from app.modules.competencia.routers.v1.baremo_router import router as baremo_router
from app.modules.competencia.routers.v1.tipo_disciplina_router import router as tipo_disciplina_router
from app.modules.competencia.routers.v1.prueba_router import router as prueba_router
from app.modules.competencia.routers.v1.competencia_router import router as competencia_router
from app.modules.competencia.routers.v1.resultado_competencia_router import router as resultado_competencia_router
from app.modules.competencia.routers.v1.registro_prueba_competencia_router import (
    router as registro_prueba_competencia_router
)

api_competencia_router_v1 = APIRouter(prefix="/competencia")
# 1. Gestión de Eventos (Competencias)
api_competencia_router_v1.include_router(
    competencia_router,
    prefix="/competencias",
    tags=["Competencias"]
)
# 2. Desempeño en Eventos Oficiales
api_competencia_router_v1.include_router(
    resultado_competencia_router,
    prefix="/resultados",
    tags=["Competencia - Resultados"]
)
# 3. Configuración de Calificación (Baremos)
api_competencia_router_v1.include_router(
    baremo_router,
    prefix="/baremos",
    tags=["Competencia - Baremos"]
)
# 4. Catálogos Base (Disciplinas y Pruebas)
api_competencia_router_v1.include_router(
    tipo_disciplina_router,
    prefix="/tipo-disciplina",
    tags=["Competencia - TipoDisciplina"]
)

api_competencia_router_v1.include_router(
    prueba_router,
    prefix="/pruebas",
    tags=["Competencia - Pruebas"]
)
# 5. Registros de Campo y Tests (Entrenamiento/Control)
api_competencia_router_v1.include_router(
    registro_prueba_competencia_router,
    prefix="/registro-pruebas",
    tags=["Competencia - Registro Prueba Competencia"]
)

from app.modules.competencia.routers.v1.registro_prueba_router import router as registro_prueba_router

api_competencia_router_v1.include_router(
    registro_prueba_router,
    prefix="/resultados-pruebas",
    tags=["Competencia - Resultados Pruebas (Tests)"]
)
