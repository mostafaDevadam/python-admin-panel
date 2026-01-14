from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.common.help import orm_to_dict2
from app.database import get_db, AsyncSessionLocal
from sqlalchemy import select  # For queries
from app.models import User
from app.schemas import UserWithRoleOut


async def getUserWithHisRole(user_id: int) -> UserWithRoleOut:
    db: AsyncSession = AsyncSessionLocal()
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(joinedload(User.role))  # Eagerly load role for nested access
        # .order_by(User.name)
    )
    result = await db.execute(stmt)
    # users = result.fetchall()
    user = result.scalar_one_or_none()
    l = UserWithRoleOut.model_validate(orm_to_dict2(user))  # by result.scalars().all()
    print("getUserWithHisRole:", l)
    return l