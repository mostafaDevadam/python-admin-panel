from datetime import datetime, timedelta
from functools import wraps
from typing import Callable

from prompt_toolkit.renderer import print_formatted_text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func  # For queries

from app.database import get_db
from app.models import User, Role, RolePermission, Permission
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session, joinedload, selectinload

from app.config import settings
from app.schemas import PermissionResponse, UserPermissionOut, RolePermissionOut, UserResponse


async def get_role_permissions_by_user_id(user_id: int, db: AsyncSession = Depends(get_db)):
    """stmt = (
        select(
            User.id.label('user_id'),
            User.name.label('user_name'),
            Role.id.label('role_id'),
            Role.name.label('role_name'),
            Permission.name.label('permission_name')
        )
        .select_from(User)
        .join(Role, User.role_id == Role.id)
        .join(RolePermission, Role.id == RolePermission.role_id)
        .join(Permission, RolePermission.permission_id == Permission.id)
        .where(User.id == user_id)
    )
    result2 = await db.execute(stmt)
    result3 = result2.fetchall()

    if not result3:
        raise HTTPException(status_code=403, detail="No data found")

    # Convert to Pydantic models
    l = [UserPermissionOut(**row._asdict()) for row in result3]"""

    stmt = (
        select(
            User.id.label('user_id'),
            User.name.label('user_name'),
            User.email.label('user_email'),
            Role.id.label('role_id'),
            Role.name.label('role_name'),
            func.aggregate_strings(
                Permission.name.distinct(),
                ', '
            ).label('permissions')
        )
        .select_from(User)
        .join(Role, User.role_id == Role.id)
        .outerjoin(RolePermission, Role.id == RolePermission.role_id)
        .outerjoin(Permission, RolePermission.permission_id == Permission.id)
        .where(User.id == user_id)
        .group_by(User.id, User.name, Role.name)
    )

    result4 = await db.execute(stmt)
    result5 = result4.fetchone()

    if not result5:
        #raise HTTPException(status_code=403, detail="No data found#")
        print(f"ERROR: No data found")
        stmt2 = select(User).where(User.id == user_id)
        result = await db.execute(stmt2)
        u = result.scalar_one_or_none()
        if not u:
            print("ERROR no user found")
        print(f"u : {u}")
        k = UserResponse.model_validate({
            "id": u.id,
            "name": u.name,
            "email": u.email,
        })
        kk = UserPermissionOut.model_validate({
            "user_id": u.id,
            "user_name": u.name,
            "has_role": False,
            "has_permissions": False,
            
        })
        print(f"k : {k}")
        return kk




    #

    """stmt3 = (
        select(
            Role.id.label('role_id'),
            Role.name.label('role_name'),
            Permission.name.label('permission_name')
        )
        .select_from(Role)
        .outerjoin(RolePermission, Role.id == RolePermission.role_id)
        .outerjoin(Permission, RolePermission.permission_id == Permission.id)
        .where(Role.id == result5.role_id)
        .order_by(Permission.name)
    )
    result_r_p = await db.execute(stmt3)
    result_r_p2 = result_r_p.fetchall()

    if not result_r_p2:
        raise HTTPException(status_code=403, detail="No data found")

    rp = [RolePermissionOut(**row._asdict()) for row in result_r_p2]
    print(f"rp : {rp}")"""


    #o = [perm.strip() for perm in result5.permissions.split(',')]
    #print(f"o: {o}")

    k = UserPermissionOut(
        user_id=result5.user_id,
        user_name=result5.user_name,
        user_email=result5.user_email,
        role_id=result5.role_id,
        role_name=result5.role_name,
        permissions=result5.permissions,  # May be None if no permissions
        permissions_list=[perm.strip() for perm in result5.permissions.split(',')],
        has_role = True,
        has_permissions= True,

    )

    #k = [UserPermissionOut(**row._asdict()) for row in result5]
    print(f"k: {k}")







    return k