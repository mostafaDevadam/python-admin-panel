from typing import Any, AsyncGenerator

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from alembic import op
from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, declarative_base
import sqlalchemy as sa
db_url = settings.DB_URL

#class Base(DeclarativeBase):
    #pass

#Base = declarative_base()
"""
engine = create_engine(
    db_url,
    pool_pre_ping=settings.POOL_PRE_PING,
    pool_size=settings.POOL_SIZE,
    max_overflow=settings.MAX_OVERFLOW,
    pool_recycle=settings.POOL_RECYCLE,
)
"""
#SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

engine = create_async_engine(db_url, echo=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass


async def get_db()-> AsyncGenerator[AsyncSession | Any, Any]:

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Auto-commit here if no exceptions
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()



def upgrade():
    # Add the column
    op.add_column('permissions', sa.Column('action_id', sa.Integer(), nullable=False))
    # Add FK constraint
    op.create_foreign_key(None, 'permissions', 'actions', ['action_id'], ['id'])

def downgrade():
    # Reverse: Drop FK and column
    op.drop_constraint(None, 'permissions', type_='foreignkey')
    op.drop_column('permissions', 'action_id')

#upgrade()
#downgrade()