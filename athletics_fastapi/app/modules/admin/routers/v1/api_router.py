from fastapi import APIRouter
from app.modules.modules import APP_TAGS_V1
from app.modules.admin.routers.v1.user_management_router import user_management_router

api_admin_router_v1 = APIRouter(prefix="/admin", tags=[APP_TAGS_V1.V1_ADMIN.value])
api_admin_router_v1.include_router(user_management_router)