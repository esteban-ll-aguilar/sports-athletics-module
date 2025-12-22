from fastapi import APIRouter
from app.modules.modules import APP_TAGS_V1

from app.modules.competencia.routers.v1.baremo_router import router as baremo_router

# Enrutador principal para la competencia
api_competencia_router_v1 = APIRouter(prefix="/competencia")

api_competencia_router_v1.include_router(baremo_router,prefix="/baremos",tags=[APP_TAGS_V1.V1_COMPETENCIA.value])


