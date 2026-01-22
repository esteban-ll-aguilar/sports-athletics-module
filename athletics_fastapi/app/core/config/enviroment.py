from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        case_sensitive=False,
        extra="ignore"  
    )
    
    # ============================================
    # CONFIGURACIÓN DE LA APLICACIÓN
    # ============================================
    application_host: str = Field("0.0.0.0", alias="APPLICATION_HOST", required=True)
    application_port: int = Field(8080, alias="APPLICATION_PORT", required=True)
    application_version: str = Field("1.0.0", alias="APPLICATION_VERSION", required=True)

    # ============================================
    # CONFIGURACIÓN DE LA BASE DE DATOS
    # ============================================
    database_name: str = Field(..., alias="DATABASE_NAME", required=True)
    database_user: str = Field(..., alias="DATABASE_USER", required=True)
    database_password: str = Field(..., alias="DATABASE_PASSWORD", required=True)
    database_host: str = Field("db", alias="DATABASE_HOST", required=True)
    database_port: int = Field(5432, alias="DATABASE_PORT", required=True)

    # Redis
    redis_url: str = Field(..., alias="REDIS_URL", required=True)

    # CORS
    cors_allow_origins: str = Field(..., alias="CORS_ALLOW_ORIGINS", required=True)
    cors_allow_credentials: bool = Field(True, alias="CORS_ALLOW_CREDENTIALS", required=True)
    cors_allow_methods: str = Field(..., alias="CORS_ALLOW_METHODS", required=True)
    cors_allow_headers: str = Field(..., alias="CORS_ALLOW_HEADERS", required=True)

    # Auth / JWT
    jwt_algorithm: str = Field(..., alias="JWT_ALGORITHM", required=True)
    jwt_secret: str = Field(..., alias="JWT_SECRET", required=True)
    access_token_expires_minutes: int = Field(..., alias="ACCESS_TOKEN_EXPIRES_MINUTES", required=True)
    refresh_token_expires_days: int = Field(..., alias="REFRESH_TOKEN_EXPIRES_DAYS", required=True)

    # Email
    email_host: str = Field(..., alias="EMAIL_HOST", required=True)
    email_port: int = Field(..., alias="EMAIL_PORT", required=True)
    email_use_tls: bool = Field(..., alias="EMAIL_USE_TLS", required=True)
    email_host_user: str = Field(..., alias="EMAIL_HOST_USER", required=True)
    email_host_password: str = Field(..., alias="EMAIL_HOST_PASSWORD", required=True)



    # Users API
    users_api_url: str = Field(..., alias="USERS_API_URL", required=True)
    users_api_email: str = Field(..., alias="USERS_API_EMAIL", required=True)
    users_api_password: str = Field(..., alias="USERS_API_PASSWORD", required=True)

    debug: bool = Field(False, alias="DEBUG", required=True)
    
    #Propiedades para consumir las URLS de la base de datos
    @property
    def database_url_async(self) -> str:
        return (
            f"postgresql+asyncpg://{self.database_user}:{self.database_password}"
            f"@{self.database_host}:{self.database_port}/{self.database_name}"
        )
    
    # @property
    # def database_url_sync(self) -> str:
    #     return (
    #         f"postgresql://{self.database_user}:{self.database_password}"
    #         f"@{self.database_host}:{self.database_port}/{self.database_name}"
    #     )


@lru_cache
def load_settings() -> Settings:
    return Settings()


_SETTINGS = load_settings()

