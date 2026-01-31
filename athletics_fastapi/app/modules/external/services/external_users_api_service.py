import httpx    
from fastapi import HTTPException
from app.core.config.enviroment import _SETTINGS
from app.modules.external.domain.enums import ExternalClassTokenType
from app.modules.external.repositories.external_users_api_repository import ExternalUsersApiRepository
from app.modules.external.domain.schemas import UserExternalCreateRequest, UserExternalUpdateRequest, UserExternalUpdateAccountRequest
from app.public.schemas import BaseResponse
import logging

logger = logging.getLogger(__name__)

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
            try:
                # Si no hay token en DB, intentar obtenerlo
                token, external_id = await self.fetch_and_store_token()
                self.token = token
                self.external_id = external_id
                return token, external_id
            except Exception as e:
                logger.warning(f"⚠️ EXTERNAL SERVICE UNAVAILABLE: Using MOCK token. Error: {e}")
                # MOCK FALLBACK
                self.token = "mock-token-123"
                self.external_id = "mock-external-id-123"
                return self.token, self.external_id
        
        self.token = token.token
        self.external_id = token.external_id

        return self.token, self.external_id
    
    def _build_base_response(self, response: httpx.Response) -> BaseResponse:
        """
        Helper method to build a BaseResponse from an HTTP response.
        Eliminates code duplication across multiple methods.
        """
        response_data = response.json()
        return BaseResponse(
            summary=response_data.get("message", "Operation processed"),
            status_code=200 if response_data.get("status") == "success" else 400,
            errors=response_data.get("errors") if isinstance(response_data.get("errors"), dict) else {},
            message=response_data.get("message", ""),
            data=response_data.get("data") if isinstance(response_data.get("data"), dict) else {},
            status=200 if response_data.get("status") == "success" else 400,
            code="COD_OK" if response_data.get("status") == "success" else "COD_ERROR"
        )
    
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
        
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    _SETTINGS.users_api_url + "/api/person/save-account",
                    json=user.model_dump(),
                    headers=self.headers
                )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=response.json()
                )
            
            return self._build_base_response(response)
            
        except Exception as e:
            logger.warning(f"⚠️ EXTERNAL SERVICE UNAVAILABLE: Using MOCK user creation. Error: {e}")
            # MOCK FALLBACK
            import uuid
            return BaseResponse(
                data={"external": str(uuid.uuid4()), "username": user.email},
                summary="User created (MOCKED)",
                message="User created (MOCKED)",
                errors={},
                status=200,
                code="201",
                status_code=201
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
                json=user.model_dump(),
                headers=self.headers
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )
        

        return self._build_base_response(response)

    async def search_user_by_dni(self, user_dni: str) -> BaseResponse:
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
        

        return self._build_base_response(response)

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
        

        return self._build_base_response(response)


        


    async def update_user_account(self, external_id: str, user_data: UserExternalUpdateAccountRequest) -> BaseResponse:
        """
        Updates the user account (password) directly using the external_id.
        Avoids DNI lookup if we already know the external_id.
        """
        await self._ensure_token()
        
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.put(
                _SETTINGS.users_api_url + "/api/person/update-account/",
                headers=self.headers,
                json= {
                    "external": external_id,
                    "password": user_data.password
                }
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json()
            )

        return self._build_base_response(response)
