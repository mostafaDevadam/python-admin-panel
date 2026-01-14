from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func  # For queries
from sqlalchemy.orm import selectinload, joinedload

from app.common.help import orm_to_dict, orm_to_dict2
from app.models import User, Role
from app.database import get_db
from app.schemas import UserResponse, UserWithRoleOut, UserUpdate
from app.security import require_permission, get_current_user, require_permission_decorator, \
    require_permissions_decorator
from app.services.role_permissions import get_role_permissions_by_user_id

user_router = APIRouter(prefix="/users")

@user_router.get("/{user_id}")
#@require_permission_decorator("read:users")
@require_permissions_decorator(["read:users"])
async def get_user(user_id: int, current_user = None, db: AsyncSession = Depends(get_db), ):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    u = UserResponse.model_validate({
        "id": user.id,
        "email": user.email,
        "name": user.name,
    })

    uu = await get_role_permissions_by_user_id(user_id, db)

    return {
        "status_code": 200,
        "message": "User found",
        "data": uu
    }

@user_router.get("/")
async def get_all_user(current_user = None, db: AsyncSession = Depends(get_db)):
    #stmt = (select(User).options(joinedload(User.role)))
    """stmt = (
        select(
            User.id.label('user_id'),
            User.name.label('user_name'),
            User.email.label('user_email'),
            Role.id.label('role_id'),
            Role.name.label('role_name')
        )
        .select_from(User)
        .join(Role, User.role_id == Role.id)
        .order_by(User.name)
    )"""
    stmt = (
        select(User)
        .options(joinedload(User.role))  # Eagerly load role for nested access
        #.order_by(User.name)
    )
    result = await db.execute(stmt)
    #users = result.fetchall()
    users = result.scalars().all()

    if not users:
        raise HTTPException(status_code=404, detail="Users not found")

    #l = [dict(row._mapping) for row in users]
    #print(l)

    #l = [UserWithRoleOut(**row._mapping) for row in users] // by result.fetchall()
    l = [UserWithRoleOut.model_validate(orm_to_dict2(row)) for row in users] # by result.scalars().all()

    #l = list(users)
    print(l)



    # Serialize
    #l = [UserResponse.model_validate(user) for user in users]

    return {
        "status_code": 200,
        "message": "User found",
        "data": l
    }

@user_router.patch("/{user_id}")
async def update_user(user_id: int, payload: UserUpdate,current_user = None, db: AsyncSession = Depends(get_db)):
    # Fetch user
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields if provided
    update_data = payload.model_dump(exclude_unset=True)  # Only non-None fields
    for key, value in update_data.items():
        setattr(user, key, value)

    # Commit the update
    await db.commit()
    await db.refresh(user)  # Reload to get fresh data (e.g., updated timestamps)

    if not user.role_id or not payload.role_id:
        return {
            "status_code": 200,
            "message": "User updated",
            "data": UserWithRoleOut.model_validate(orm_to_dict2(user))
        }

    # Eager load role for output
    role_stmt = select(Role).where(Role.id == user.role_id)
    role_result = await db.execute(role_stmt)
    role = role_result.scalars().first()

    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Manually set role if needed (since refresh doesn't reload relationships)
    user.role = role

    # Convert to Pydantic
    ur = UserWithRoleOut.model_validate(orm_to_dict2(user))

    return {
        "status_code": 200,
        "message": "User with assign role to user updated",
        "data": ur
    }


@user_router.get("/all/count")
async def get_count_users(current_user = None, db: AsyncSession = Depends(get_db)):
    stmt = select(func.count(User.id))  # Or func.count() for all rows
    result = await db.execute(stmt)  # scalar() for single value
    count = result.scalar()
    if not count:
        raise HTTPException(status_code=404, detail="Users not found")

    return {
        "status_code": 200,
        "message": "Users count",
        "data": {"count": count}
    }




