from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.representante.routers.v1.representante_router import representante_router



api_representante_router_v1 = APIRouter(prefix="/representante")

api_representante_router_v1.include_router(representante_router, tags=["Representante"])