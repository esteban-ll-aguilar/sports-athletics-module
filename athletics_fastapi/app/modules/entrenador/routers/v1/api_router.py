from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.auth.routers.v1.admin.admin_routes import admin_router



api_auth_router_v1 = APIRouter(prefix="/entrenador")
