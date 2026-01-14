from __future__ import annotations
from contextlib import asynccontextmanager
import asyncio
import socketio
import uvicorn
from fastapi import FastAPI, Depends
import os
#from starlette.staticfiles import StaticFiles
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.database import engine, Base, get_db
from app.routers.action import action_router, seed_actions
from app.routers.audit import audit_router
from app.routers.permissions import permission_router
from app.routers.photos import photos_router
from app.routers.roles import roles_router
from app.routers.auth import auth_router
from app.routers.upload import upload_router
from app.routers.users import user_router
from app.security import get_current_user
from app.socket import setupSocketIO

# Load .env vars (call early, before using os.getenv)
load_dotenv()
#alembic_cfg = Config("alembic.ini")


# socket
#sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")

#
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables using the fixed Base
    #Base.metadata.create_all(bind=engine)
    #command.upgrade(alembic_cfg, "head")
    async with engine.begin() as conn:  # Get AsyncConnection
        #await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)  # Async-safe create_all
        #await asyncio.to_thread(Base.metadata.create_all)  # Thread for sync DDL
        #registry.configure(conn)
        #await seed_auth_data(Depends(get_db))
        #db: AsyncSession = Depends(get_db)
        #await seed_actions(conn)
    yield
    #await asyncio.to_thread(engine.dispose)
    await engine.dispose()

app = FastAPI(lifespan=lifespan)
# socket app
socket_app = setupSocketIO(app)

# static folder
folder = os.path.dirname(__file__)

app.mount("/static", StaticFiles(directory=folder+"/../upload"), name="static")

# routes
app.include_router(auth_router)
app.include_router(router=roles_router,  dependencies=[Depends(get_current_user)])

app.include_router(router=permission_router, dependencies=[Depends(get_current_user)])

app.include_router(router=action_router, dependencies=[Depends(get_current_user)])

app.include_router(router=audit_router, dependencies=[Depends(get_current_user)])

app.include_router(router=upload_router, dependencies=[Depends(get_current_user)])

app.include_router(router=user_router, dependencies=[Depends(get_current_user)])

app.include_router(router=photos_router, dependencies=[Depends(get_current_user)])
@app.get("/")
async def root():
    return {"message": "Hello World"}


app = socket_app  # Reassign to mount Socket.IO

#connect_socket()