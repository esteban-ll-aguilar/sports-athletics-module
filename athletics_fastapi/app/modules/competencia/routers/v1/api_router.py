from fastapi import APIRouter
from app.modules.modules import APP_TAGS_V1

from app.modules.competencia.routers.v1.baremo_router import router as baremo_router
from app.modules.competencia.routers.v1.tipo_disciplina_router import router as tipo_disciplina_router
from app.modules.competencia.routers.v1.prueba_router import router as prueba_router
from app.modules.competencia.routers.v1.competencia_router import router as competencia_router
from app.modules.competencia.routers.v1.resultado_competencia_router import router as resultado_competencia_router

# Enrutador principal para la competencia
api_competencia_router_v1 = APIRouter(prefix="/competencia")

# Ruta Competencia
api_competencia_router_v1.include_router(competencia_router, prefix="/competencias", tags=[APP_TAGS_V1.V1_COMPETENCIA.value])
# Ruta Resultado Competencia
api_competencia_router_v1.include_router(resultado_competencia_router, prefix="/resultados", tags=[APP_TAGS_V1.V1_COMPETENCIA.value])
# Ruta Baremos
api_competencia_router_v1.include_router(baremo_router, prefix="/baremos", tags=[APP_TAGS_V1.V1_COMPETENCIA.value])
# Ruta Tipo Disciplina
api_competencia_router_v1.include_router(tipo_disciplina_router, prefix="/tipo-disciplina", tags=[APP_TAGS_V1.V1_COMPETENCIA.value])
# Ruta Prueba
api_competencia_router_v1.include_router(prueba_router, prefix="/pruebas", tags=[APP_TAGS_V1.V1_COMPETENCIA.value])
