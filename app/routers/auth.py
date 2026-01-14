from fastapi import APIRouter, Request, Depends, HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import JSONResponse

from app.database import get_db
from app.models import User, AuditLog, Role
from app.schemas import UserLogin, UserResponse, UserCreate, ResponseModel, TokenRefresh, Token, TokenBody
from app.security import verify_password, create_access_token, create_refresh_token, decode_token, hash_password
from sqlalchemy import select  # For queries

from app.services.role_permissions import get_role_permissions_by_user_id
from app.socket import send_admin_notification

"""
"""
auth_router = APIRouter(prefix="/auth")

@auth_router.post("/login" )
async def login(payload: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    print(f"payload: {payload}")
    result = await db.execute(select(User).where(User.email == payload.email))#.filter(User.email == payload.email).first()
    user = result.scalar_one_or_none()
        
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access = create_access_token({"sub": str(user.id)})
    refresh = create_refresh_token({"sub": str(user.id)})






    db.add(AuditLog(
        user_id=user.id,
        action="LOGIN",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    user_role_perm = await get_role_permissions_by_user_id(user.id, db)
    if not user_role_perm:
        return {
            "status_code": 200,
            "message": "Logged in successfully",
            "data": {"access": access, "refresh": refresh, "user": ""}
         }

    #response = Response(content={"access_token": access, "token_type": "bearer"})
    #response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="strict")

    await send_admin_notification(message=f"user {user_role_perm.user_name} is logged-in", data={"user_name": user_role_perm.user_name})

    content = {
        "access_token": access,
        "token_type": "bearer",
        "user_id": user.id
    }
    response = JSONResponse(content=content)  # Explicit JSONResponse

    # Set refresh cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # HTTPS only in prod
        samesite="strict"
    )

    #return response

    return {
        "status_code": 200,
        "message": "Logged in successfully",
        "data": {"access": access, "refresh": refresh, "user": user_role_perm }
    }



@auth_router.post("/refresh", response_model=ResponseModel)
def refresh_token(payload1: TokenBody):
    payload  = decode_token(payload1.token)
    print(payload)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    #refresh = create_refresh_token({"sub": payload["sub"]})

    return {
        "status_code": 200,
        "message": "Successfully refreshed token",
        "data": {
            "access": create_access_token({"sub": payload["sub"]}),
            "refresh": create_refresh_token({"sub": payload["sub"]})
        }
    }

@auth_router.post("/register", response_model=dict)
def create_admin(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    #role = Role(name="test1")
    #db.add(role)

    user = User(
        email=str(payload.email),
        name=payload.name,
        password=hash_password(payload.password),
        #role_id=role.id
    )
    db.add(user)

    return {"status_code": 201, "message": "User created successfully"}



