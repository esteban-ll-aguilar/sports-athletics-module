"""
Representante Test Router - No Rate Limiting
Provides representante endpoints without rate limiting for testing.
"""
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.domain.models.auth_user_model import AuthUserModel
from app.modules.auth.domain.schemas.schemas_users import UserCreateSchema, UserUpdateSchema
from app.api.schemas.api_schemas import APIResponse
from app.modules.atleta.domain.schemas.atleta_schema import AtletaRead
from app.modules.representante.services.representante_service import RepresentanteService
from app.modules.representante.dependencies import get_representante_service

router = APIRouter(prefix="/representante")


@router.post("/athletes", response_model=APIResponse[AtletaRead], status_code=status.HTTP_201_CREATED)
async def register_athlete_child(
    child_data: UserCreateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: Register child athlete"""
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
        message=f"{result['message']} (TEST)",
        data=AtletaRead.model_validate(result["data"])
    )


@router.put("/athletes/{atleta_id}", response_model=APIResponse[AtletaRead])
async def update_athlete_child(
    atleta_id: int,
    update_data: UserUpdateSchema,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: Update child athlete"""
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
        message=f"{result['message']} (TEST)",
        data=AtletaRead.model_validate(result["data"])
    )


@router.get("/me", response_model=APIResponse)
async def get_representante_profile(
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: Get representante profile"""
    result = await service.get_representante_profile(current_user.id)
    
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
        message=f"{result['message']} (TEST)",
        data=result["data"]
    )


@router.get("/atletas", response_model=APIResponse)
async def list_represented_athletes(
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: List represented athletes"""
    result = await service.get_represented_athletes(current_user.id)
    
    if not result["success"]:
        return JSONResponse(
            status_code=result["status_code"],
            content=APIResponse(
                success=False,
                message=result["message"],
                data=None
            ).model_dump()
        )
    
    athletes = [AtletaRead.model_validate(a) for a in result["data"]]
    
    return APIResponse(
        success=True,
        message=f"{result['message']} (TEST)",
        data=athletes
    )


@router.get("/atletas/{atleta_id}/entrenamientos", response_model=APIResponse)
async def get_athlete_trainings(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: Get athlete trainings"""
    result = await service.get_athlete_trainings(current_user.id, atleta_id)
    
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
        message=f"{result['message']} (TEST)",
        data=result["data"]
    )


@router.get("/atletas/{atleta_id}/historial", response_model=APIResponse)
async def get_athlete_history(
    atleta_id: int,
    current_user: AuthUserModel = Depends(get_current_user),
    service: RepresentanteService = Depends(get_representante_service)
):
    """TEST: Get athlete history"""
    result = await service.get_athlete_history(current_user.id, atleta_id)
    
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
        message=f"{result['message']} (TEST)",
        data=result["data"]
    )
