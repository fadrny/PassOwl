from pydantic import BaseModel, ConfigDict
from typing import Optional, List, ForwardRef
from datetime import datetime


# Forward reference declarations
RoleRef = ForwardRef('Role')
PasswordCategoryRef = ForwardRef('PasswordCategory')


# User schemas
class UserBase(BaseModel):
    username: str


class UserCreate(BaseModel):
    username: str
    login_password_hash: str
    login_salt: str
    encryption_salt: str


class UserLogin(BaseModel):
    username: str
    login_password_hash: str


class UserUpdate(BaseModel):
    avatar_url: Optional[str] = None


# Role schemas
class RoleBase(BaseModel):
    name: str


class Role(RoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# User schema with roles (defined after Role)
class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    roles: List[Role] = []


# PasswordCategory schemas
class PasswordCategoryBase(BaseModel):
    name: str
    color_hex: Optional[str] = None


class PasswordCategoryCreate(PasswordCategoryBase):
    pass


class PasswordCategoryUpdate(BaseModel):
    name: Optional[str] = None
    color_hex: Optional[str] = None


class PasswordCategory(PasswordCategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


# Credential schemas (defined after PasswordCategory)
class CredentialBase(BaseModel):
    title: str
    url: Optional[str] = None
    username: str
    encrypted_data: str
    encryption_iv: str


class CredentialCreate(CredentialBase):
    category_ids: List[int] = []


class CredentialUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    username: Optional[str] = None
    encrypted_data: Optional[str] = None
    encryption_iv: Optional[str] = None
    category_ids: Optional[List[int]] = None


class Credential(CredentialBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    categories: List[PasswordCategory] = []


# SecureNote schemas
class SecureNoteBase(BaseModel):
    encrypted_title: str
    encrypted_content: str
    encryption_iv: str


class SecureNoteCreate(SecureNoteBase):
    pass


class SecureNoteUpdate(BaseModel):
    encrypted_title: Optional[str] = None
    encrypted_content: Optional[str] = None
    encryption_iv: Optional[str] = None


class SecureNote(SecureNoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


# AuditLog schemas
class AuditLogBase(BaseModel):
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None


class AuditLog(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    created_at: datetime


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    roles: List[str] = []


# Additional schemas for salt endpoint
class UserSalts(BaseModel):
    login_salt: str
    encryption_salt: str
