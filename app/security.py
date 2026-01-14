from datetime import datetime, timedelta
from functools import wraps
from inspect import signature
from typing import Callable, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  # For queries

from app.database import get_db
from app.models import User, Role, RolePermission, Permission
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload, selectinload

from app.config import settings
from app.schemas import PermissionResponse, UserPermissionOut

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# password hashing
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# jwt
def create_access_token(data: dict) -> str :
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "access"})
    # Fix: Cast sub to string (handles int IDs)
    if "sub" in to_encode and isinstance(to_encode["sub"], (int, float)):
        to_encode["sub"] = str(to_encode["sub"])
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

# token
def decode_token(token: str):
    print(f"decode_token ")

    try:
        payload = jwt.decode(str(token), settings.JWT_SECRET, algorithms="HS256",options={"verify_exp": True, "leeway": 0})
        print(f"payload#: {payload}")
        return payload
    except JWTError as e:
        print(e)
        raise HTTPException(status_code=401, detail="invalid token")

# deps
async def get_current_user(token: str= Depends(oauth2_scheme), db: AsyncSession= Depends(get_db)):
    print(f"token: {token}")
    payload = decode_token(token)
    print(f"payload: {payload} {payload["sub"]}")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="invalid access token")

    sub_str = payload.get("sub")
    userId = int(sub_str)

    if not sub_str:
        raise HTTPException(401, "Missing sub claim")

    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_permission(permission: str):
    async def checker(user=Depends(get_current_user),db: AsyncSession = Depends(get_db)):


        stmt = (
            select(
                User.id.label('user_id'),
                User.name.label('user_name'),
                Role.name.label('role_name'),
                Permission.name.label('permission_name')
            )
            .select_from(User)
            .join(Role, User.role_id == Role.id)
            .join(RolePermission, Role.id == RolePermission.role_id)
            .join(Permission, RolePermission.permission_id == Permission.id)
            .where(User.id == user.id)
        )
        result2 = await db.execute(stmt)
        result3 = result2.fetchall()

        if not result3:
            raise HTTPException(status_code=403, detail="Permission denied")

        for up in result3:
            el = UserPermissionOut.model_validate(up)
            print("f el: {el}")

        # Convert to Pydantic models
        l = [UserPermissionOut(**row._asdict()) for row in result3]

        print(f"l: {l}")
        print(f"Permission: {permission}")

        for row in l:
            if row.permission_name == permission:
                print(f"equal: {row.permission_name} == {permission}")
                return True
            if row.permission_name is not permission:
                raise HTTPException(status_code=403, detail="Permission denied")
        return True

    return checker


def require_permission_decorator(permission_name: str):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(
            current_user = Depends(lambda: require_permission(permission_name)),  # Inject the dep
            **kwargs
        ):
            return await func(current_user=current_user, **kwargs)
        return wrapper
    return decorator


async def require_permissions(
        permissions: List[str],
        logic: str = "or",  # "and" (all required) or "or" (any required)
) -> User:
    # Eager load user with role and permissions (single role)
    print(f"permissions: {permissions}")
    async def checker(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):


        stmt = (
            select(User)
            .options(
                selectinload(User.role).selectinload(Role.permissions)  # Load role → permissions
            )
            .where(User.id == user.id)
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.role:
            raise HTTPException(status_code=403, detail="No role assigned")

        # Flatten permissions from user's single role
        user_permissions = [p.name for p in user.role.permissions]
        print(f"user_permissions: {user_permissions}")

        # Check logic
        if logic.lower() == "or":
            if not any(perm in user_permissions for perm in permissions):
                raise HTTPException(
                    status_code=403,
                    detail=f"At least one of {permissions} is required (user has: {user_permissions})"
                )
        else:  # "and" (default)
            if not all(perm in user_permissions for perm in permissions):
                raise HTTPException(
                    status_code=403,
                    detail=f"All of {permissions} are required (user has: {user_permissions})"
                )
        return True

    return checker



def require_permissions_decorator(permissions: List[str], logic: str = "or"):
    def decorator(func: Callable):

        # Get original signature
        sig = signature(func)

        @wraps(func)
        async def wrapper(
                current_user=Depends(lambda: require_permissions(permissions, logic)),
                **kwargs  # All other params (path, query, body) go here
        ):
            # Call original with current_user + original kwargs
            return await func(current_user=current_user, **kwargs)
        return wrapper
    return decorator