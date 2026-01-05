from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.auth.routers.v1.admin.admin_routes import admin_router
from app.modules.representante.routers.v1.representante_router import representante_router



api_auth_router_v1 = APIRouter(prefix="/example")

api_representante_router_v1 = APIRouter()
api_representante_router_v1.include_router(representante_router, tags=["Representante"])