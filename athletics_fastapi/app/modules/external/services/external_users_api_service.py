import httpx
from fastapi import HTTPException
from app.core.config.enviroment import _SETTINGS
from app.modules.external.domain.enums import ExternalClassTokenType
from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
from app.modules.external.domain.schemas import UserExternalCreateRequest, UserExternalUpdateRequest, UserExternalUpdateAccountRequest
from app.public.schemas import BaseResponse


class ExternalUsersApiService:

    def __init__(self, repo: ExternalUsersApiRepository):
        self.token = None
        self.external_id = None
        self.repo = repo
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _ensure_token(self):
        if not self.token:
             self.token, self.external_id = await self.get_auth_token()
             self.headers["Authorization"] = "Bearer " + self.token

    async def get_auth_token(self) -> tuple[str, str]:
        token = await self.repo.get_token_by_type(ExternalClassTokenType.AUTH_TOKEN)
        
        if not token:
             # Si no hay token en DB, intentar obtenerlo (o lanzar error si se prefiere)
             # Para este caso, asumimos que si no esta, intentamos fetch
            try:
                token, external_id = await self.fetch_and_store_token()
                self.token = token
                self.external_id = external_id

                return token, external_id
            except Exception as e:
                raise HTTPException(status_code=404, detail="Token no encontrado")
        
        self.token = token.token
        self.external_id = token.external_id

        return self.token, self.external_id
    
    async def fetch_and_store_token(self) -> tuple[str, str]:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                _SETTINGS.users_api_url + "/api/person/login",
                json={
                    "email": _SETTINGS.users_api_email,
                    "password": _SETTINGS.users_api_password,
                }
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        token = response.json().get("data").get("token")
        external_id = response.json().get("data").get("external")

        await self.repo.update_token(
            token=token,
            external_id=external_id,
            token_type=ExternalClassTokenType.AUTH_TOKEN
        )

        return token, external_id

    


    async def create_user(self, user: UserExternalCreateRequest) -> BaseResponse:
        await self._ensure_token()
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                _SETTINGS.users_api_url + "/api/person/save-account",
                json=user.dict(),
                headers=self.headers
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )
        

        return BaseResponse(
            data=response.json().get("data"),
            message=response.json().get("message"),
            errors=response.json().get("errors"),
            status=200 if response.json().get("status") == "success" else 404
        )


    async def update_user(self, user: UserExternalUpdateRequest) -> BaseResponse:

        await self._ensure_token()
        user_search = await self.search_user_by_dni(user.dni)

        if not user_search: # Fix potential bug: check user_search, not user (which is input)
             # NOTE: Original code checked 'if not user', which is the input object and never None.
             # Assuming intent was to check if user exists.
             # 'user_search' returns a BaseResponse object.
             # Need to verify if 'user_search.data' is valid.
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )
        
        user.external = user_search.data.get("external")

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                _SETTINGS.users_api_url + "/api/person/update",
                json=user.dict(),
                headers=self.headers
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )
        

        return BaseResponse(
            data=response.json().get("data"),
            message=response.json().get("message"),
            errors=response.json().get("errors"),
            status=200 if response.json().get("status") == "success" else 404
        )

    async def search_user_by_dni(self, user_dni: int) -> BaseResponse:
        await self._ensure_token()
        headers = {
            **self.headers,
            "external": self.external_id
        }

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                _SETTINGS.users_api_url + "/api/person/search_identification/" + str(user_dni),
                headers=headers
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )
        

        return BaseResponse(
            data=response.json().get("data"),
            message=response.json().get("message"),
            errors=response.json().get("errors"),
            status=200 if response.json().get("status") == "success" else 404
        )

    async def update_account(self, user: UserExternalUpdateAccountRequest) -> BaseResponse:
        await self._ensure_token()
        
        search_user = await self.search_user_by_dni(user.dni)
        external_user_id = search_user.data.get("external")

        if not external_user_id:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.put(
                _SETTINGS.users_api_url + "/api/person/update-account/",
                headers=self.headers,
                json= {
                    "external": external_user_id,
                    "password": user.password
                }
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )
        

        return BaseResponse(
            data=response.json().get("data"),
            message=response.json().get("message"),
            errors=response.json().get("errors"),
            status=200 if response.json().get("status") == "success" else 404
        )


        


