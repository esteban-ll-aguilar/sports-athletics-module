from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema, UserUpdateSchema
from app.api.schemas.api_schemas import APIResponse
from app.modules.atleta.domain.schemas.atleta_schema import AtletaRead
from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.representante.dependencies import get_representante_service

representante_router = APIRouter()

@representante_router.post(
    "/athletes", 
    response_model=APIResponse[AtletaRead], 
    status_code=status.HTTP_201_CREATED,
    summary="Registrar atleta hijo",
    description="Registra un atleta (hijo) vinculado al representante autenticado."
)
async def register_athlete_child(
    child_data: UserCreateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service.register_child_athlete(current_user.id, child_data)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message=result["message"],
        data=AtletaRead.model_validate(result["data"])
    )

@representante_router.put(
    "/athletes/{atleta_id}", 
    response_model=APIResponse[AtletaRead], 
    status_code=status.HTTP_200_OK,
    summary="Actualizar atleta hijo"
)
async def update_athlete_child(
    atleta_id: int,
    update_data: UserUpdateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service.update_child_athlete(current_user.id, atleta_id, update_data)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message=result["message"],
        data=AtletaRead.model_validate(result["data"])
    )

@representante_router.get(
    "/athletes", 
    response_model=APIResponse[list[AtletaRead]], 
    status_code=status.HTTP_200_OK,
    summary="Listar mis atletas"
)
async def get_my_athletes(
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service.get_representante_athletes(current_user.id)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=[]
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message=result["message"],
        data=[AtletaRead.model_validate(a) for a in result["data"]]
    )
    
@representante_router.get(
    "/athletes/{atleta_id}", 
    response_model=APIResponse[AtletaRead], 
    status_code=status.HTTP_200_OK,
    summary="Detalle de atleta"
)
async def get_athlete_detail(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service._validate_relation(current_user.id, atleta_id)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message="Detalle obtenido",
        data=AtletaRead.model_validate(result["data"])
    )

@representante_router.get(
    "/athletes/{atleta_id}/historial",
    summary="Historial del atleta"
)
async def get_athlete_historial(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service.get_athlete_historial(current_user.id, atleta_id)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message=result["message"],
        data=result["data"]
    )

@representante_router.get(
    "/athletes/{atleta_id}/estadisticas",
    summary="Estadísticas del atleta"
)
async def get_athlete_stats(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    result = await service.get_athlete_stats(current_user.id, atleta_id)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
        
    return APIResponse(
        success=True,
        message=result["message"],
        data=result["data"]
    )
