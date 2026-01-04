from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.auth.routers.v1.auth import auth_router_v1
from app.modules.auth.routers.v1.admin.admin_routes import admin_router



api_auth_router_v1 = APIRouter(prefix="/auth")

api_auth_router_v1.include_router(auth_router_v1, tags=[APP_TAGS_V1.V1_AUTH.value])
api_auth_router_v1.include_router(admin_router, prefix="/admin", tags=[APP_TAGS_V1.V1_ADMIN.value])
api_auth_router_v1.include_router(api_auth_router_v1, prefix="/login", tags=[APP_TAGS_V1.V1_AUTH.value])
api_auth_router_v1.include_router(api_auth_router_v1, prefix="/register", tags=[APP_TAGS_V1.V1_AUTH.value])