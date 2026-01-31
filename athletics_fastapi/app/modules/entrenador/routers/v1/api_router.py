from fastapi import APIRouter



api_entrenador_router_v1 = APIRouter(prefix="/entrenador")

from app.modules.entrenador.routers.v1.entrenamiento_router import router as entrenamiento_router
from app.modules.entrenador.routers.v1.horario_router import router as horario_router
from app.modules.entrenador.routers.v1.asistencia_router import router as asistencia_router

api_entrenador_router_v1.include_router(entrenamiento_router)
api_entrenador_router_v1.include_router(horario_router)
api_entrenador_router_v1.include_router(asistencia_router)
