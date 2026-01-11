from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.admin.routers.v1.admin_routes import admin_router



api_admin_router_v1 = APIRouter(prefix="/admin")

api_admin_router_v1.include_router(admin_router, tags=[APP_TAGS_V1.V1_ADMIN.value])
