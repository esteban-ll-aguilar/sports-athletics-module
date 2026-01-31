from fastapi import APIRouter, Depends, status
from app.modules.external.services.external_users_api_service import ExternalUsersApiService
from app.public.schemas import BaseResponse


from app.modules.external.dependencies import get_external_users_service

users_router = APIRouter()


@users_router.put("/token")
async def update_token(service: ExternalUsersApiService = Depends(get_external_users_service)):

    token, external_id = await service.fetch_and_store_token()

    return BaseResponse(
        summary="Token actualizado",
        status_code=status.HTTP_200_OK,
        errors={},
        message="Token actualizado correctamente",
        data={
            "token": token,
            "external_id": external_id
        },
        status=status.HTTP_200_OK,
        code="COD_OK"
    )




    


