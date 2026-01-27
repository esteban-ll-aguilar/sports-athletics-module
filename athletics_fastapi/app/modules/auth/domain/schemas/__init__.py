from app.modules.auth.domain.schemas.pagination_schema import PaginatedUsers, PaginatedUsersWithRelations
from app.modules.auth.domain.schemas.user_role_schema import UserRoleUpdate

from app.modules.auth.domain.schemas.schemas_two_factor import (
    Enable2FAResponse,
    Verify2FARequest,
    Disable2FARequest,
    Login2FARequest,
    TwoFactorRequired,
    LoginBackupCodeRequest,
)

from app.modules.auth.domain.schemas.schemas_mail_service import (
    EmailVerificationRequest,
    ResendVerificationRequest,
)

from app.modules.auth.domain.schemas.schemas_session import (
    SessionInfo,
    SessionsListResponse,
    RevokeSessionRequest,
)

from app.modules.auth.domain.schemas.schemas_users import (
    UserBaseSchema,
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserSimpleSchema,
    AtletaSimpleSchema,
    EntrenadorSimpleSchema,
    RepresentanteSimpleSchema,
    UserAuthSchema,
    UserWithRelationsSchema,
)

from app.modules.auth.domain.schemas.schemas_auth import (
    TokenPair,
    RefreshRequest,
    PasswordResetRequest,
    PasswordResetCodeValidation,
    PasswordResetConfirm,
    PasswordResetComplete,
    PasswordChangeRequest,
    MessageResponse,
    UserUpdateRequest,
    LoginSchema,
)

__all__ = [
    # 2FA
    "Enable2FAResponse",
    "Verify2FARequest",
    "Disable2FARequest",
    "Login2FARequest",
    "TwoFactorRequired",
    "LoginBackupCodeRequest",

    # Email
    "EmailVerificationRequest",
    "ResendVerificationRequest",

    # Auth
    "TokenPair",
    "LoginSchema",
    "RefreshRequest",
    "PasswordResetRequest",
    "PasswordResetCodeValidation",
    "PasswordResetConfirm",
    "PasswordResetComplete",
    "PasswordChangeRequest",
    "MessageResponse",
    "UserUpdateRequest",

    # Sessions
    "SessionInfo",
    "SessionsListResponse",
    "RevokeSessionRequest",

    # Users
    "UserBaseSchema",
    "UserCreateSchema",
    "UserUpdateSchema",
    "UserResponseSchema",
    "UserSimpleSchema",
    "UserWithRelationsSchema",
    "UserAuthSchema",

    # Relations
    "AtletaSimpleSchema",
    "EntrenadorSimpleSchema",
    "RepresentanteSimpleSchema",

    # Pagination / Roles
    "PaginatedUsers",
    "PaginatedUsersWithRelations",
    "UserRoleUpdate",
]
