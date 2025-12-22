"""Módulo de etiquetas de los módulos de la API (v1).

Este archivo centraliza las etiquetas (tags) usadas por los routers
de la API v1 para agrupar endpoints en la documentación OpenAPI
(Swagger / Redoc) y para mantener consistencia en los nombres de los
grupos a lo largo del proyecto.

Uso típico:
    from app.modules.modules import APP_TAGS_V1
    router.include_router(auth_router, prefix="/auth", tags=[APP_TAGS_V1.V1_AUTH.value])

Las etiquetas se definen como miembros de un enum para evitar
strings dispersos por el código y facilitar el autocompletado y
la refactorización.
"""

import enum


class APP_TAGS_V1(enum.Enum):
    """Etiquetas (tags) para la versión 1 de la API.

    Cada miembro representa un grupo lógico de endpoints. Usar el
    atributo `.value` cuando se pase la etiqueta a `FastAPI` o a
    `include_router` (por ejemplo `tags=[APP_TAGS_V1.V1_AUTH.value]`).
    """

    # Grupo general de autenticación (login, refresh, logout, etc.)
    V1_AUTH = "Auth V1"

    # Endpoints relacionados con el registro/gestión por email
    V1_AUTH_EMAIL = "Auth V1 - Email"

    # Endpoints para manejo de sesiones (listado, revocación, etc.)
    V1_AUTH_SESSIONS = "Auth V1 - Sessions"

    # Endpoints y flujos de autenticación en dos pasos (2FA)
    V1_AUTH_2FA = "Auth V1 - Two-Factor Authentication"

    # Flujos para restablecimiento de contraseña (reset)
    V1_AUTH_RESET_PASSWORD = "Auth V1 - Password Reset"

    # Etiqueta para endpoints administrativos / panel de administración
    V1_AUTH_ADMIN = "Auth V1 - Admin"

    V1_ADMIN = "Admin V1"


    V1_EXTERNAL = "External API V1"
    # Etiqueta para endpoints relacionados con competencias
    V1_COMPETENCIA = "Competencia"
