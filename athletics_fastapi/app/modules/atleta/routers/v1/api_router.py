from fastapi import APIRouter

api_auth_router_v1 = APIRouter(prefix="/atleta")

from app.modules.atleta.routers.v1.atleta_simple_router import router
api_auth_router_v1.include_router(router)