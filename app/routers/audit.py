from pydantic import ValidationError

from app.schemas import PermissionCreate, PermissionResponse, AuditLogCreate, AuditLogResponse, UserAuditLogsResponse, \
    UserResponse, AuditLogWithUserOut
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, selectinload, joinedload
from app.database import get_db
from app.models import Role, AuditLog, User, Permission
from app.schemas import ResponseModel, RoleCreate, RoleResponse, RoleAssign
from app.security import get_current_user, require_permissions_decorator, require_permission_decorator
from sqlalchemy import select, Text, text, label, func  # For queries

audit_router = APIRouter(prefix="/audits")

"""@audit_router.post("/user/{user_id}", response_model=ResponseModel)
async def create_audit(user_id: int, payload: AuditLogCreate, request: Request, db: AsyncSession = Depends(get_db),
                       user=Depends(get_current_user)):
    if not payload.action:
        raise HTTPException(status_code=500, detail="AuditLogin field is required")

    result = await db.execute(select(AuditLog).where(AuditLog.action == payload.action))
    audit = result.scalar_one_or_none()



    if audit is not None:
        raise HTTPException(status_code=409, detail="AuditLogin is already exist")

    # Auto-fill from request
    ip = request.client.host if request.client else payload.ip or "unknown"
    user_agent = request.headers.get("user-agent", payload.user_agent or "unknown")

    new_audit = AuditLog(action=payload.action, ip=ip, user_agent=user_agent)
    db.add(new_audit)
    await db.flush()
    await db.commit()
    await db.refresh(new_audit)

    return {
        "status_code": 200,
        "message": "Created audit successfully",
        "data": "AuditLogResponse.model_validate(new_audit)"
    }
"""

@audit_router.get("/all/user/{user_id}", response_model=ResponseModel)
@require_permission_decorator("read:audit_logs")
#@require_permissions_decorator(["read:audit_logs"])
async def get_all_audits_by_user_id(user_id: int, request: Request,current_user = None, db: AsyncSession = Depends(get_db),
                       user=Depends(get_current_user)):
    stmt = select(User).options(selectinload(User.audit_logs)).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    logs_response = []

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #u = UserResponse.model_validate({ "id": user.id, "email": user.email})

    for log in user.audit_logs:
        if log and hasattr(log, 'id') and log.id is not None:
            try:
                print(f"log: {log}")
                perm_response = AuditLogResponse.model_validate({
                    "id": log.id,
                    "action": log.action,
                    "ip": log.ip,
                    "user_agent": log.user_agent,
                    "created_at": log.created_at,

                })
                logs_response.append(perm_response)
                print(f"log-> {perm_response}")
            except ValidationError as e:
                print(f"Validation Error: {e}")

    return {
        "status_code": 200,
        "message": "Get AutLogs by User successfully",
        "data": logs_response
    }

@audit_router.get("/")
async def get_all_audits(request: Request,current_user = None, db: AsyncSession = Depends(get_db),
                       user=Depends(get_current_user)):
    # Base query with eager-loaded user
    #stmt = select(AuditLog)#.options(selectinload(AuditLog.user))
    #stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    #stmt = text("SELECT * FROM auth_db.audit_logs ORDER BY created_at DESC")  # Added ORDER BY for usability
    #stmt = (select(AuditLog).options(joinedload(AuditLog.user)).order_by(AuditLog.created_at.desc()))
    """stmt = (
        select(
            label('audit_log_id', AuditLog.id),
            AuditLog.action,
            AuditLog.ip,
            AuditLog.created_at,
            label('user_id', User.id),
            label('user_name', User.name)
        )
        .select_from(AuditLog)
        .join(User, AuditLog.user_id == User.id)  # Equivalent to INNER JOIN
    )"""
    stmt = (
        select(AuditLog)
        .options(joinedload(AuditLog.user))  # Eagerly load user for nested access
        .order_by(AuditLog.created_at.desc())  # Optional: sort by newest first
    )
    result = await db.execute(stmt)
    #result = await db.execute(stmt).scalars().all()
    #audit_logs = result.fetchall()
    audit_logs = result.scalars().all()

    # Convert to list of dicts (assuming columns are known; use Row._mapping)


    if not audit_logs:
        raise HTTPException(status_code=404, detail="Audit logs not found")

    #b = [AuditLogWithUserOut(**row._mapping) for row in audit_logs]
    b =[AuditLogWithUserOut.model_validate(row) for row in audit_logs]

    print(b)

    #l = [dict(row._mapping) for row in audit_logs]
    #a = [AuditLogResponse.model_validate(k) for k in l]
    #g = list(audit_logs)

    #f = [AuditLogResponse.model_validate(row) for row in audit_logs]



    #for s in l:
        #print(f"s: {s}")

    #print(l)
    #print(a)
    #print(g)
    #print(gg)

    return {
        "status_code": 200,
        "message": "Get AutLogs by User successfully",
        "data": b
    }


@audit_router.get("/all/count")
async def get_count_users(current_user = None, db: AsyncSession = Depends(get_db)):
    stmt = select(func.count(AuditLog.id))  # Or func.count() for all rows
    result = await db.execute(stmt)  # scalar() for single value
    count = result.scalar()
    if not count:
        raise HTTPException(status_code=404, detail="Users not found")

    return {
        "status_code": 200,
        "message": "AuditLogs count",
        "data": {"count": count}
    }
