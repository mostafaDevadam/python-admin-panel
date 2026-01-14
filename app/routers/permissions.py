from typing import List, Optional

from pydantic import ValidationError, BaseModel, ConfigDict
from starlette import status
from dataclasses import dataclass

from app.common.help import orm_to_dict
from app.schemaDataclasses import CPermissionIDs
from app.schemas import PermissionCreate, PermissionResponse
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, joinedload, selectinload
from app.database import get_db
from app.models import Role, AuditLog, User, Permission, Action, RolePermission
from app.schemas import ResponseModel, RoleCreate, RoleResponse, RoleAssign
from app.security import get_current_user, require_permission_decorator
from sqlalchemy import select, func, and_, insert, delete, text  # For queries

permission_router = APIRouter(prefix="/permissions")


@permission_router.post("/", response_model=ResponseModel)
async def create_permission(payload: PermissionCreate, request: Request, db: AsyncSession = Depends(get_db),
                            user=Depends(get_current_user)):
    # In seed function (after create_all)
    if not payload.name:
        raise HTTPException(500, f"No data provided")

    result = await db.execute(select(Permission).where(Permission.name == str(payload.name)))
    result2 = result.scalar_one_or_none()
    if result2 is not None:
        raise HTTPException(409, f"Permission '{payload.name}' already exists")

    # Fetch action by name (e.g., split perm_in.name = "create:users" → action="create")
    action_name = payload.name.split(':')[0] if ':' in payload.name else "read"  # Default or from input

    result_action = await db.execute(select(Action).where(Action.name == action_name))
    action = result_action.scalar_one_or_none()
    if not action:
        raise HTTPException(404, f"Action '{action_name}' not found")
    print("action:", action.id)
    # await db.flush()

    # print("action:", action)

    # Create permission with action
    permission = Permission(
        name=payload.name,
        resource=payload.resource,
        description=payload.description,
        action_id=action.id,
        # action=action  # Links via relationship (sets action_id)
    )

    db.add(permission)
    await db.commit()
    await db.flush()
    await db.refresh(permission)

    p = PermissionResponse.model_validate(orm_to_dict(permission))
    print(f"p: {p}")

    db.add(AuditLog(
        user_id=user.id,
        action=f"CREATE PERMISSION {permission.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    """
    if not result2:
        meta_perm = Permission(name=payload.name, resource=payload.resource, description=payload.description)
        db.add(meta_perm)
        await db.flush()
        await db.commit()  # Now commit the transaction
        await db.refresh(meta_perm)



        return {
            "status_code": 200,
            "message": "Created permission successfully",
            "data": PermissionResponse.model_validate(meta_perm)
        }
    """

    return {
        "status_code": 200,
        "message": " created permission successfully",
        "data": p
    }

    """
    if result2:
        raise HTTPException(409, f"Permission '{payload.name}' already exists (ID: {result2.id})")
    if not result.scalar_one_or_none():
        meta_perm = Permission(name=payload.name, resource=payload.resource, description=payload.description)
        db.add(meta_perm)
        return {
            "status_code": 200,
            "message": "Created permission successfully",
            "data": "PermissionResponse.model_validate(meta_perm)"
        }
    """

    """
        # Link to admin role
        result = await db.execute(select(Role).where(Role.name == "admin"))
        admin = result.scalar_one_or_none()
        if admin:
            admin.permissions.append(meta_perm)
            #await db.commit()
    """
    # return "None"


@permission_router.post("/assign/{permission_id}/role/{role_id}", response_model=ResponseModel)
async def assign_permission_to_role(
        role_id: int,
        permission_id: int,
        request: Request,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user)
):
    result_role = await db.execute(select(Role).where(Role.id == role_id))
    role = result_role.scalar_one_or_none()
    result_permission = await db.execute(select(Permission).where(Permission.id == permission_id))
    permission = result_permission.scalar_one_or_none()
    if not role:
        raise HTTPException(404, "Role not found")

    if not permission:
        raise HTTPException(404, "Permission not found")

    # Assign via relationship (adds to junction)
    # role.permissions.append(result_permission)
    # await db.commit()

    association = RolePermission(
        role_id=role.id,
        permission_id=permission.id,
        notes="Granted for Q1 review"
    )
    db.add(association)
    await db.commit()

    db.add(AuditLog(
        user_id=user.id,
        action=f"ASSIGN PERMISSION {permission.name} TO ROLE  {role.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    """item = Item(name="item1")
    db.add(item)
    detail= Detail(name="detail1")
    db.add(detail)
    both = ItemDetail(
        detailId=detail.id,
        itemId=item.id,
    )
    db.add(both)
    await db.commit()"""

    return {
        "status_code": 200,
        "message": "Assign permission to role successfully",
        "data": "assign_permission_to_role"
    }


class ManyPermissionIds(BaseModel):
    permission_ids: List[int]


class PermissionOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None


@permission_router.post("/assign/role/{role_id}")
async def assign_many_permissions_to_role(
        role_id: int,
        payload: CPermissionIDs,
        request: Request,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user)

):
    print(f"assign_many_permissions_to_role role_id: {role_id}, permission_ids: {payload.permission_ids}")

    # get role
    result_role = await db.execute(select(Role).where(Role.id == role_id))
    role = result_role.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role_doc = RoleResponse.model_validate({
        "id": role.id,
        "name": role.name
    })
    stmt_perm = (select(Permission).where(Permission.id.in_(payload.permission_ids)))
    result_perms = await db.execute(stmt_perm)
    perms = result_perms.scalars().all()
    if not perms:
        raise HTTPException(status_code=404, detail="Permissions not found")

    perms_docs = [PermissionOut.model_validate(orm_to_dict(row)) for row in perms]

    print(f"role: {role_doc}")
    print(f"permissions: {perms_docs}")

    perm_names: List[str] = []
    per_names_str: str = ""

    #[perm_names.append(row.name) for row in perms_docs]
    #[perm_names.append(row.name) for row in perms_docs]

    perm_names = list(dict.fromkeys([row.name for row in perms_docs]))

    string_list = [str(item.name) for item in perms_docs]  # Convert to strings
    per_names_str = ", ".join(string_list)

    print(f"per_names: {perm_names}")
    print(f"per_names_str: {per_names_str}")

    #
    stmt = (
        select(Role.id, Permission.id)
        .select_from(Role, Permission)  # Implicit CROSS JOIN
        .where(and_(Role.id == role_id,Permission.id.in_(payload.permission_ids) ))
    )

    # Insert from the select
    insert_stmt = insert(RolePermission).from_select(
        [RolePermission.role_id, RolePermission.permission_id],
        stmt
    )

    result = await db.execute(insert_stmt)

    if not result:
        raise HTTPException(status_code=404, detail="Permission not found")

    db.add(AuditLog(
        user_id=user.id,
        action=f"ASSIGN MANY PERMISSIONS LIST {per_names_str} TO ROLE  {role.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    return {
        "status_code": 200,
        "message": "Assign many permissions to role successfully",
        "data": ""
    }


@permission_router.delete("/unassign/role/{role_id}")
async def remove_assigned_role_from_role_permissions(
        role_id: int,
        request: Request,
        db: AsyncSession = Depends(get_db)

):
    stmt = delete(RolePermission).where(RolePermission.role_id == role_id)
    result = await db.execute(stmt)

    if not result:
        raise HTTPException(status_code=404, detail="RolePermission not found")

    print(f"result: ${result.rowcount}")

    return {
        "status_code": 200,
        "message": "Removed Assigned role for many permissions successfully",
        "data": ""
    }


@permission_router.get("/{id}")
@require_permission_decorator("read:permissions")
async def get_permission_by_id(id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(Permission).where(Permission.id == id).options(
        selectinload(Permission.roles).selectinload(RolePermission.role)  # Nested load
    )
    result = await db.execute(stmt)
    permission = result.scalar_one_or_none()
    await db.flush()

    if not permission:
        raise HTTPException(404, "Permission not found")

    print(f"role: {permission.id} {permission.name} {len(permission.roles)} {permission.roles[1].role.id}")

    # Loop with safety checks
    role_responses = []
    for rp in permission.roles:
        role = rp.role
        if role and hasattr(role, 'id') and role.id is not None:  # Check loaded
            try:
                print(f"role#: {role.id} {role.name}")
                role_response = RoleResponse.model_validate({
                    "id": role.id,
                    "name": role.name,
                })
                role_responses.append(role_response)
            except ValidationError as e:
                print(f"Validation failed for role {role.id}: {e}")  # Debug
        else:
            print(f"Skipping unloaded role in association {rp.id}")

    print(f"p: {role_responses}")

    p = PermissionResponse.model_validate({
        "id": permission.id,
        "name": permission.name,
        "resource": permission.resource,
        "description": permission.description,
        "roles": role_responses
    })

    return {
        "status_code": 200,
        "message": "Permission found",
        "data": p,
    }


class PermissionWithRoleOut(BaseModel):
    permission_id: int
    permission_name: str
    permission_description: Optional[str] = None
    role_id: Optional[int] = None
    role_name: Optional[str] = None

class RoleOut(BaseModel):
    id: int
    name: str

class PermissionWithOptionalRoleOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    roles: List[RoleOut] = []


class PermissionWithSingleRoleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int  # permission_id
    name: str  # permission_name
    description: Optional[str] = None  # permission_description
    resource: Optional[str] = None
    role: Optional[RoleOut] = None
    has_role: Optional[bool] = False


@permission_router.get("/")
@require_permission_decorator("read:permissions")
async def get_all_permissions(current_user=None, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    q = select(Permission)
    result = await db.execute(q)
    permissions = result.scalars().all()

    if not permissions:
        raise HTTPException(404, "Permissions not found")

    stmt = (
        select(
            Permission.id.label('permission_id'),
            Permission.name.label('permission_name'),
            Permission.description.label('permission_description'),
            Permission.resource.label('permission_resource'),
            Role.id.label('role_id'),
            Role.name.label('role_name')
        )
        .select_from(Permission)
        .outerjoin(RolePermission, Permission.id == RolePermission.permission_id)
        .outerjoin(Role, RolePermission.role_id == Role.id)
        .order_by(Permission.name, Role.name)
    )
    result = await db.execute(stmt)
    perms = result.fetchall()

    if not perms:
        raise HTTPException(404, "Permissions not found")

    p = [PermissionWithRoleOut(**row._mapping) for row in perms]
    print(f"p: {p}")

    #
    # Flat query (no aggregation) for single role per row
    stmt = (
        select(
            Permission.id,
            Permission.name,
            Permission.description,
            Permission.resource,
            Role.id.label('role_id'),  # For mapping
            Role.name.label('role_name')
        )
        .select_from(Permission)
        .outerjoin(RolePermission, Permission.id == RolePermission.permission_id)
        .outerjoin(Role, RolePermission.role_id == Role.id)
        .order_by(Permission.name, Role.name)
    )


    result = await db.execute(stmt)
    docs = result.fetchall()

    if not docs:
        raise HTTPException(404, "Permissions not found")

    # Convert to Pydantic with optional role object
    output = []
    for row in docs:
        perm_dict = {
            'id': row[0],
            'name': row[1],
            'description': row[2],
            'resource': row[3],
            'has_role': False
        }

        # Build optional role object
        role_id = row[4]
        if role_id is not None:
            perm_dict['has_role'] = True
            perm_dict['role'] = RoleOut(
                id=role_id,
                name=row[5]
            )
        else:
            perm_dict['has_role'] = False
            perm_dict['role'] = None

        output.append(PermissionWithSingleRoleOut.model_validate(perm_dict))


    print(f"output: {output}")


    old_data = [PermissionResponse.model_validate({
            "id": perm.id,
            "name": perm.name,
            "resource": perm.resource,
            "description": perm.description,
        }) for perm in permissions]


    return {
        "status_code": 200,
        "message": "Permissions found",
        "data": output
    }


@permission_router.delete("/{id}")
@require_permission_decorator("delete:permissions")
async def remove_permission_by_id(id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # Fetch permission
    result = await db.execute(select(Permission).where(Permission.id == id))
    permission = result.scalar_one_or_none()
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    # Delete (cascades to RolePermission)
    await db.delete(permission)
    await db.commit()

    return None  # 204 No Content


@permission_router.get("/all/count")
async def get_count_permissions(current_user=None, db: AsyncSession = Depends(get_db)):
    stmt = select(func.count(Role.id))  # Or func.count() for all rows
    result = await db.execute(stmt)  # scalar() for single value
    count = result.scalar()
    if not count:
        raise HTTPException(status_code=404, detail="Users not found")

    return {
        "status_code": 200,
        "message": "Permissions count",
        "data": {"count": count}
    }
