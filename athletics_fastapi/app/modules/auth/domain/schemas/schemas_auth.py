from pydantic import BaseModel
from typing import Optional


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginSchema(BaseModel):
    username: str
    password: str



class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetCodeValidation(BaseModel):
    email: str
    code: str


class PasswordResetConfirm(BaseModel):
    email: str
    code: str
    new_password: str


class PasswordResetComplete(BaseModel):
    message: str


class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


class MessageResponse(BaseModel):
    message: str


class UserUpdateRequest(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class AdminUserUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    profile_image: Optional[str] = None
    role: Optional[str] = None
