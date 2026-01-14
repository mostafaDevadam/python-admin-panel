# In lifespan startup (before yield), add:
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  # For queries

from app.database import AsyncSessionLocal
from app.models import Role, User, Permission

async def seed_auth_data(db):  # Pass db from engine.begin() if needed

        # Permission
        perm = Permission(name="test:auth")
        db.add(perm)


        await db.commit()


