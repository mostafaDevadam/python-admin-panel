from __future__ import annotations

from datetime import datetime
from typing import Optional, TypeVar, Generic, List, ForwardRef

from pydantic import BaseModel, EmailStr, ConfigDict, ValidationError, validate_call, field_validator, model_validator
from pydantic.generics import GenericModel
from app.models import Role, Permission

# response
T = TypeVar("T")

class ResponseModel(GenericModel, Generic[T]):
    status_code: int
    message: str
    data: Optional[T]
# photo
class PhotoResponse(BaseModel):
    id: int
    url: Optional[str]
    user_id: Optional[int]
    user: Optional[UserResponse]


    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class PhotoOut(BaseModel):
    id: int
    url: str  # e.g., photo URL
    # Add other photo fields as needed


# user
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
      email: EmailStr
      password: str
      name: Optional[str]
      #role_id: Optional[int]

class UserUpdate(BaseModel):
      name: Optional[str]
      email: Optional[str] = None
      #password: Optional[str]
      role_id: Optional[int]


class UserResponse(BaseModel):
      id: int
      email: Optional[EmailStr] = None
      name: Optional[str] = None
      is_active: Optional[bool] = False
      role: Optional["RoleResponse"] | None = None

      model_config = ConfigDict(
          arbitrary_types_allowed=True,
          from_attributes=True
      )

class UserWithRoleOut(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str] = None
    is_active: Optional[bool] = False
    #role_id: Optional[int]
    #role_name: Optional[str]  # Optional if description can be None
    role: Optional[RoleOut] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )


#
class UserPhotosResponse(BaseModel):
    user_id: int
    name: str
    photos: List[PhotoResponse] | None = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )
#
class UserPermissionOut(BaseModel):
    user_id: int
    user_name: str
    user_email: Optional[str] = None
    has_role: Optional[bool] = False
    has_permissions: Optional[bool] = False
    role_id: Optional[int] = None
    role_name: Optional[str] = None
    permission_name: Optional[str] = None
    permissions: Optional[str] = None
    permissions_list: List[str] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )
#
# Pydantic Model for individual permission output (one per row)
class RolePermissionOut(BaseModel):
    role_id: int
    role_name: str
    permission_name: Optional[str] = None  # None if no permissions

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

# role
class RoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class RoleAssign(BaseModel):
    role_id: str  # Assign by name (or use role_id: int)

class RoleCreate(BaseModel):
    name: str

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )
class RoleWithPermissionsOut(BaseModel):
    role_id: int
    role_name: str
    permissions: Optional[str] = None  # Comma-separated string (empty if none)
    permissions_list: List[str] = None

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

# permission
class PermissionAssign(BaseModel):
    role_id: str


class PermissionCreate(BaseModel):
    name: str
    resource: str
    description: str
    #action_id: int

#PermissionResponse = ForwardRef("PermissionResponse")  # Forward declare

class PermissionResponse(BaseModel):
    id: int
    name: Optional[str]
    resource: Optional[str]
    description: Optional[str]
    roles: List[RoleResponse] = []



    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

    @field_validator('roles', mode='before')
    @classmethod
    def validate_permissions(cls, v):
        if isinstance(v, list):
            return [RoleResponse.model_validate(p) for p in v if hasattr(p, 'name')]  # Example validation
        return v or []

    @model_validator(mode='before')
    @classmethod
    def preload_relationships(cls, data):
        if isinstance(data, Permission):
            # Ensure permissions loaded (if not eager)
            if not data.roles:
                data.roles = data.query_roles()  # Custom method if needed
        return data

# role response

class RoleResponse(BaseModel):
    id: int
    name: Optional[str] = None
    permissions: List[PermissionResponse] = []  # Nested list (many-to-many)


    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

    @field_validator('permissions', mode='before')
    @classmethod
    def validate_permissions(cls, v):
        if isinstance(v, list):
            return [PermissionResponse.model_validate(p) for p in v if hasattr(p, 'name')]  # Example validation
        return v or []

    @model_validator(mode='before')
    @classmethod
    def preload_relationships(cls, data):
        if isinstance(data, Role):
            # Ensure permissions loaded (if not eager)
            if not data.permissions:
                data.permissions = data.query_permissions()  # Custom method if needed
        return data

try:
    RoleResponse()
except ValidationError as exc:
    print(repr(exc.errors()[0]['type']))
#
"""class RolePermissionResponse:
    role_id: int
    permission_id: int

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )
"""
#
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


# action
class ActionCreate(BaseModel):
    name: str

class ActionResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )


# audit
class AuditLogCreate(BaseModel):
    action: str
    ip: Optional[str] = None
    user_agent: Optional[str] = None



class AuditLogResponse(BaseModel):
    id: int
    action: str
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserResponse] = None # Nested user

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class AuditLogWithUserOut(BaseModel):
    id: int
    action: str
    ip: str
    created_at: Optional[datetime]  # Or datetime if preferred
    user_id: Optional[int]
    #user_name: Optional[str]
    user: Optional[UserOut]  # Nested user object

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class UserAuditLogsResponse(BaseModel):
    user_id: int
    user: UserResponse
    audit_logs: List[AuditLogResponse] = []

    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        from_attributes=True
    )


# token
class Token(BaseModel):
    access: Optional[str]
    refresh: Optional[str]

class TokenBody(BaseModel):
    token: str

class TokenRefresh(BaseModel):
    refresh: str


#RoleResponse.model_rebuild()  # Call once after all models defined