from fastapi import APIRouter

from app.modules.atleta.routers.v1.atleta_simple_router import router as atleta_router
from app.modules.atleta.routers.v1.historial_medico_router import router as historial_router
from app.modules.modules import APP_TAGS_V1

api_atleta_router_v1 = APIRouter(
    prefix="/atleta",
    tags=[APP_TAGS_V1.V1_ATLETA.value]
)

# Router principal de atletas
api_atleta_router_v1.include_router(atleta_router)

# Router de historial médico
api_atleta_router_v1.include_router(
    historial_router,
    prefix="/historial-medico"
)
