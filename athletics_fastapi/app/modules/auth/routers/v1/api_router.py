from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.auth.routers.v1.auth import auth_router_v1
from app.modules.auth.routers.v1.email import auth_email_router_v1
from app.modules.auth.routers.v1.password_reset import reset_password_router_v1
from app.modules.auth.routers.v1.sessions import auth_sessions_router_v1
from app.modules.auth.routers.v1.twofa import auth_twofa_router_v1
from app.modules.auth.routers.v1.admin.admin_routes import admin_router
from app.modules.auth.routers.v1.users import users_router_v1


api_auth_router_v1 = APIRouter(prefix="/auth")

api_auth_router_v1.include_router(auth_router_v1, tags=[APP_TAGS_V1.V1_AUTH.value])
api_auth_router_v1.include_router(auth_email_router_v1, prefix="/email", tags=[APP_TAGS_V1.V1_AUTH_EMAIL.value])
api_auth_router_v1.include_router(reset_password_router_v1, prefix="/password-reset", tags=[APP_TAGS_V1.V1_AUTH_RESET_PASSWORD.value])
api_auth_router_v1.include_router(auth_sessions_router_v1, prefix="/sessions", tags=[APP_TAGS_V1.V1_AUTH_SESSIONS.value])
api_auth_router_v1.include_router(auth_twofa_router_v1, prefix="/2fa", tags=[APP_TAGS_V1.V1_AUTH_2FA.value])
api_auth_router_v1.include_router(admin_router, prefix="/admin", tags=[APP_TAGS_V1.V1_ADMIN.value])
api_auth_router_v1.include_router(users_router_v1, prefix="/users", tags=[APP_TAGS_V1.V1_AUTH.value])
