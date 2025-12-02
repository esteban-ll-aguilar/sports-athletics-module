import enum

class APP_TAGS_V1(enum.Enum):
    V1_AUTH = "Auth V1"
    V1_AUTH_EMAIL = "Auth V1 - Email"
    V1_AUTH_SESSIONS = "Auth V1 - Sessions"
    V1_AUTH_2FA = "Auth V1 - Two-Factor Authentication"
    V1_AUTH_RESET_PASSWORD = "Auth V1 - Password Reset"
    V1_ADMIN = "Admin V1"