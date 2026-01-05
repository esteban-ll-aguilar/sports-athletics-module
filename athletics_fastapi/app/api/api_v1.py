"""
Módulo: api_v1_router.py
Descripción:
    Este módulo define el enrutador principal para la versión 1 (v1) de la API.
    Agrupa y organiza los submódulos de rutas correspondientes a:
        - Autenticación y gestión de usuarios (auth)
        - Administración del sistema (admin)

    El objetivo es centralizar todos los endpoints bajo el prefijo común `/api/v1`,
    asegurando una estructura clara, modular y escalable para el proyecto.

"""
# Importaciones de FastAPI y los submódulos de rutas
from fastapi import APIRouter
from app.modules.auth.routers.v1.admin.admin_routes import admin_router
from app.modules.admin.routers.v1.api_router import api_admin_router_v1
from app.modules.external.routers.v1.api_router import api_external_router_v1
from app.modules.competencia.routers.v1.api_router import api_competencia_router_v1
from app.modules.atleta.routers.v1.api_router import api_atleta_router_
from app.modules.entrenador.routers.v1.api_router import api_auth_router_v1 as api_entrenador_router_v1

# Enrutador principal de la versión 1 de la API
router_api_v1 = APIRouter(prefix='/api/v1')
router_api_v1.include_router(api_admin_router_v1)
router_api_v1.include_router(api_external_router_v1)
router_api_v1.include_router(api_competencia_router_v1)
router_api_v1.include_router(api_entrenador_router_v1)

import app.modules.atleta.routers.v1.api_router as atleta_mod
router_api_v1.include_router(atleta_mod.api_auth_router_v1)

from app.modules.representante.routers.v1.api_router import api_representante_router_v1
router_api_v1.include_router(api_representante_router_v1, prefix="/representante")
router_api_v1.include_router(api_atleta_router_v1)




