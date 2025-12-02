from fastapi import APIRouter
from app.modules.auth.routers.v1.api_router import api_auth_router_v1
from app.modules.auth.routers.v1.admin.admin_routes import admin_router

router_api_v1 = APIRouter(prefix='/api/v1')
router_api_v1.include_router(api_auth_router_v1)