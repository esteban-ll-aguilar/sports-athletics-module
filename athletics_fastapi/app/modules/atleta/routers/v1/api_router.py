from fastapi import APIRouter
from app.modules.atleta.routers.v1.historial_medico_router import router as historial_router
from app.modules.modules import APP_TAGS_V1

api_atleta_router_v1 = APIRouter(
    prefix="/atleta",
    tags=[APP_TAGS_V1.V1_ATLETA.value]
)

# Incluimos el router de atletas

# Incluimos el router del historial médico con su propio prefijo
api_atleta_router_v1.include_router(
    historial_router,
    prefix="/historial-medico",  # Esto hará que las rutas queden como /atleta/historial-medico/...
    tags=[APP_TAGS_V1.V1_ATLETA.value]  # Puedes poner un tag diferente si quieres
)
