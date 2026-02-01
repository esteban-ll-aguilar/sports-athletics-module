"""
Configuración del Enrutador de Administración V1.

Este módulo centraliza todas las rutas que requieren privilegios administrativos
bajo el prefijo global '/admin', facilitando la aplicación de middlewares de 
seguridad y la organización en la documentación de la API.
"""
from app.modules.modules import APP_TAGS_V1
from fastapi import APIRouter
from app.modules.admin.routers.v1.admin_routes import admin_router


# Definición del enrutador principal para la sección administrativa
api_admin_router_v1 = APIRouter(prefix="/admin")
# Inclusión de las rutas específicas de administración
# Se inyecta la etiqueta (Tag) correspondiente para agrupar en Swagger UI
api_admin_router_v1.include_router(admin_router, tags=[APP_TAGS_V1.V1_ADMIN.value])
