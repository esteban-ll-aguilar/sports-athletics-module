from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.atleta.routers.v1.atleta_router import router as atleta_router

# Enrutador principal para atleta
api_atleta_router_v1 = APIRouter(prefix="/atleta")

# Ruta Atleta
api_atleta_router_v1.include_router(atleta_router, tags=[APP_TAGS_V1.V1_ATLETA.value])

