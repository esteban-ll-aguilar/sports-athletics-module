from fastapi import APIRouter
from app.modules.pasante.routers.v1.pasante_router import router as pasante_router

api_pasante_router_v1 = APIRouter()

api_pasante_router_v1.include_router(pasante_router, prefix='/pasantes', tags=['Pasantes'])
