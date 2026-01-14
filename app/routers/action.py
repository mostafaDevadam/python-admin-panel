from app.schemas import PermissionCreate, PermissionResponse, AuditLogCreate, AuditLogResponse, ActionCreate, \
    ActionResponse
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Role, AuditLog, User, Permission, Action
from app.schemas import ResponseModel, RoleCreate, RoleResponse, RoleAssign
from app.security import get_current_user, require_permission_decorator
from sqlalchemy import select  # For queries

action_router = APIRouter(prefix="/actions")

async def seed_actions(db: AsyncSession):
    actions = [
        {"name": "create", "description": "Create resource"},
        {"name": "read", "description": "Read resource"},
        {"name": "update", "description": "Update resource"},
        {"name": "delete", "description": "Delete resource"}
    ]
    for act_data in actions:
        result = await db.execute(select(Action).where(Action.name == act_data["name"]))
        if not result.scalar_one_or_none():
            action = Action(**act_data)
            db.add(action)
    await db.commit()

#seed_actions(Depends(get_db))


@action_router.post("/", response_model=ResponseModel)
@require_permission_decorator("create:action")
async def create_action(payload: ActionCreate,request: Request, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Action).where(Action.name == payload.name))
    result2 = result.scalar_one_or_none()
    if result2:
        raise HTTPException(status_code=409, detail="Action is already exist")
    action = Action(name=payload.name)
    db.add(action)
    await db.flush()
    await db.commit()

    db.add(AuditLog(
        user_id=user.id,
        action=f"CREATE ACTION {action.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    return {
        "status_code": 200,
        "message": "Created action successfully",
        "data": ""
    }

@action_router.get("/")
async def get_all_actions(current_user= None, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    result = await db.execute(select(Action))
    actions = result.scalars().all()
    await db.flush()

    if not actions:
        raise HTTPException(status_code=404, detail="No actions data found")

    all = [ActionResponse.model_validate(row) for row in actions]

    return {
        "status_code": 200,
        "message": "Get all actions successfully",
        "data": all
    }