from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.external.routers.v1.users import users_router

api_external_router_v1 = APIRouter(prefix="/external")


api_external_router_v1.include_router(users_router, prefix="/users", tags=[APP_TAGS_V1.V1_EXTERNAL])