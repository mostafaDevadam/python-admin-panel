from typing import Optional, List

from fastapi import APIRouter, Request, Depends, HTTPException
from pydantic import ValidationError, BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database import get_db
from app.models import Role, AuditLog, User, RolePermission, Permission
from app.schemas import ResponseModel, RoleCreate, RoleResponse, RoleAssign, PermissionResponse, RolePermissionOut, \
    RoleWithPermissionsOut
from app.security import get_current_user, require_permission_decorator
from sqlalchemy import select, func, update, and_  # For queries

roles_router = APIRouter(prefix="/roles", tags=["Roles"])


@roles_router.post("/", response_model=ResponseModel)
@require_permission_decorator("create:roles")
async def create_role(payload: RoleCreate, request: Request, current_user=None, db: AsyncSession = Depends(get_db),
                      user=Depends(get_current_user)):  #
    print(f"creating role {payload.name}")

    # Check name uniqueness
    result = await db.execute(select(Role).where(Role.name == payload.name))
    role = result.scalar_one_or_none()
    if role:
        raise HTTPException(status_code=400, detail="Role name already exists")

    role = Role(name=str(payload.name))
    print(f" role {role.name}")
    db.add(role)
    await db.flush()
    await db.commit()

    db.add(AuditLog(
        user_id=user.id,
        action=f"CREATE ROLE {role.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    # db.refresh(role)

    # print(f"user: {user.id}")

    # db.add(AuditLog(user_id=user.id, action=f"CREATE ROLE {role.name}"), ip=request.client.host)
    # db.commit()
    role_ = RoleResponse.model_validate({
        "id": role.id,
        "name": role.name
    })

    return {
        "status_code": 201,
        "message": "Role created",
        "data": role_,
    }


@roles_router.patch("/{role_id}/assign/user/{user_id}", response_model=ResponseModel)
async def assign_user_to_role(user_id: int, role_id: int, request: Request, db: AsyncSession = Depends(get_db),
                              user=Depends(get_current_user)):
    # Fetch target user
    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(404, "User not found")

    # Fetch role by name
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(404, f"Role '{role_id}' not found")

    # Assign (updates role_id)
    target_user.role = role  # SQLAlchemy auto-updates FK
    target_user.is_active = True  # Optional: Reactivate if needed

    db.add(AuditLog(
        user_id=user.id,
        action=f"ASSIGN ROLE {role.name} TO USER  {target_user.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    return {
        "status_code": 201,
        "message": "Role assigned",
        "data": RoleResponse.model_validate({
            "id": role.id,
            "name": role.name
        }),
    }


@roles_router.patch("/{role_id}/unassign/user/{user_id}")
async def removed_assigned_role_for_user(
        role_id: int,
        user_id: int,
        request: Request,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user)
):
    result_role = await db.execute(select(Role).where(Role.id == role_id))
    role = result_role.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role_doc = RoleResponse.model_validate({
        "id": role.id,
        "name": role.name
    })

    print(f"role_doc: {role_doc}")

    stmt = (
        update(User)
        .where(
            and_(
                User.id == user_id,
                User.role_id == role_id
            )
        )
        .values(role_id=None)  # Set to NULL
    )

    result = await db.execute(stmt)

    if not result:
        raise HTTPException(status_code=404, detail="User not found")

    print(f"result: {result.rowcount}")

    db.add(AuditLog(
        user_id=user.id,
        action=f"REMOVED ASSIGNED ROLE PERMISSION {role_doc.name} TO ROLE  {user.name}",
        ip=request.client.host,
        user_agent=request.headers.get("user-agent"),
    ))
    await db.commit()

    return {
        "status_code": 200,
        "message": "Removed assigned role for user",
        "data": ""
    }

class RoleWithoutPermissionsOut(BaseModel):
    role_id: int
    role_name: str


@roles_router.get("/all/not/assigned")
async def get_roles_not_assigned_to_permissions(
        request: Request,
        db: AsyncSession = Depends(get_db),
        user=Depends(get_current_user)
):
    stmt = (
        select(
            Role.id.label('role_id'),
            Role.name.label('role_name')
        )
        .select_from(Role)
        .outerjoin(RolePermission, Role.id == RolePermission.role_id)
        .where(RolePermission.role_id.is_(None))  # IS NULL equivalent
        .order_by(Role.name)
    )


    result = await db.execute(stmt)
    roles= result.fetchall()

    if not roles:
        #raise HTTPException(status_code=404, detail="Role not found")
        return {
            "status_code": 204,
            "message": "no data",
            "data": []
        }



    docs = [RoleWithoutPermissionsOut(**row._mapping) for row in roles]

    print(f"docs: {docs}")

    return {
        "status_code": 200,
        "message": "Get Role is not assigned to Permissions",
        "data": docs
    }


@roles_router.get("/{id}")
@require_permission_decorator("read:roles")
async def get_role_by_id(id: int, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    stmt = select(Role).where(Role.id == id).options(
        selectinload(Role.permissions).selectinload(RolePermission.permission)  # Nested load
    )
    result = await db.execute(stmt)
    role = result.scalar_one_or_none()
    await db.flush()

    if not role:
        raise HTTPException(404, "Role not found")

    print(f"role: {role.id} {role.name} {len(role.permissions)} {role.permissions[0]}")

    # Loop with safety checks
    permission_responses = []
    for rp in role.permissions:
        permission = rp.permission
        if permission and hasattr(permission, 'id') and permission.id is not None:  # Check loaded
            try:
                perm_response = PermissionResponse.model_validate(permission)
                permission_responses.append(perm_response)
            except ValidationError as e:
                print(f"Validation failed for permission {permission.id}: {e}")  # Debug
        else:
            print(f"Skipping unloaded permission in association {rp.id}")

    print(f"p: {permission_responses}")

    # Loop and validate each permission
    """permission_responses = []
    for permission in role.permissions:
        try:
            perm_response = PermissionResponse.model_validate(permission)
            permission_responses.append(perm_response.model_dump())  # Serialize to dict
        except ValidationError as e:
            # Log or skip invalid
            print(f"Skipping invalid permission {permission}: {e}")"""

    # permission_responses = []
    # Loop over permissions
    """for permission in role.permissions:
        #p = PermissionResponse.model_validate()
        print(f"Permission ID: {permission}")
        p = permission.permission
        if p:  # Safety check
            #perm_response = PermissionResponse.model_validate(p)  # Validate single Permission
            #permission_responses.append(perm_response)
            print(f"p: {p}")"""

    r = RoleResponse.model_validate({
        "id": role.id,
        "name": role.name,
        "permissions": permission_responses,
    })

    # r= RoleResponse.model_validate(role)

    return {
        "status_code": 200,
        "message": "Role found",
        "data": r,  # "RoleResponse.model_validate(role)",
    }


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    name: Optional[str] = None
    email: Optional[str] = None
    # Add other user fields as needed


class RoleWithSingleUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int  # role_id
    name: str  # role_name
    description: Optional[str] = None  # role_description
    user: Optional[UserOut] = None  # Single optional user object (None if unassigned)

class RoleWithPermissionsAndUserOut(BaseModel):
    role_id: int
    role_name: str
    permissions: Optional[str] = None  # Comma-separated permissions; None if no permissions
    permissions_list: List[str] = None
    user: Optional[UserOut] = None
    #user_id: Optional[int] = None
    #user_name: Optional[str] = None
    #user_email: Optional[str] = None
    has_user: Optional[bool] = False
    has_permissions: Optional[bool] = False

@roles_router.get("/")
async def get_all_roles(db: AsyncSession = Depends(get_db)):
    """stmt = (
        select(
            Role.id.label('role_id'),
            Role.name.label('role_name'),
            func.aggregate_strings(
                Permission.name.distinct(),
                ', '
            ).label('permissions')
        )
        .select_from(Role)
        .outerjoin(RolePermission, Role.id == RolePermission.role_id)
        .outerjoin(Permission, RolePermission.permission_id == Permission.id)
        .group_by(Role.id, Role.name)
        # .order_by(Role.name)
    )
    # stmt = select(Role).options(selectinload(Role.permissions))
    result = await db.execute(stmt)  # (select(Role))#.options(selectinload(Role.permissions)))
    roles = result.fetchall()

    if not roles:
        raise HTTPException(status_code=404, detail="No roles data found")

    # all_r = [RolePermissionOut(**row._asdict()) for row in roles]
    # print(f"all_r: {all_r}")

    output = []


    for row in roles:
        row_dict = dict(row._mapping)  # Convert Row to dict consistently

        # Extract and process permissions string to list
        permissions_str = row_dict.get('permissions')
        if permissions_str:
            permissions_list = [perm.strip() for perm in permissions_str.split(', ')]
        else:
            permissions_list = []

        # Update dict with the list (override if needed)
        row_dict['permissions_list'] = permissions_list

        output.append(RoleWithPermissionsOut(**row_dict))

    print(f"output:", output)

    # all = [RoleResponse.model_validate({ "id": role.id, "name": role.name, "permissions": None}) for role in roles]

    # roles with user
    # Flat query (no aggregation) for single user per row
    stmt = (
        select(
            Role.id,
            Role.name,
            User.id.label('user_id'),  # For mapping
            User.name.label('user_name'),
            User.email.label('user_email')
        )
        .select_from(Role)
        .outerjoin(User, Role.id == User.role_id)
        .order_by(Role.name, User.name)
    )


    result = await db.execute(stmt)
    roles_user = result.fetchall()

    if not roles_user:
        raise HTTPException(status_code=404, detail="Roles user not found")

    # Convert to Pydantic with optional single user object
    roles_u_output = []
    for row in roles_user:
        role_dict = {
            'id': row[0],
            'name': row[1]
        }

        # Build optional user object
        user_id = row[2]
        if user_id is not None:
            role_dict['user'] = UserOut(
                id=user_id,
                name=row[3],
                email=row[4]
            )
        else:
            role_dict['user'] = None

        roles_u_output.append(RoleWithSingleUserOut.model_validate(role_dict))

    print(f"roles_u_output:", roles_u_output)"""
    # roles -> user, permissions
    # Subquery for aggregated permissions per role
    permissions_sub = (
        select(
            Role.id.label('role_id'),
            func.aggregate_strings(
                Permission.name.distinct(),
                ', '
            ).label('permissions')
        )
        .select_from(Role)
        .outerjoin(RolePermission, Role.id == RolePermission.role_id)
        .outerjoin(Permission, RolePermission.permission_id == Permission.id)
        .group_by(Role.id)
    ).subquery()

    # Main query: Join subquery to Role + flat users
    stmt = (
        select(
            Role.id.label('role_id'),
            Role.name.label('role_name'),
            permissions_sub.c.permissions.label('permissions'),
            User.id.label('user_id'),
            User.name.label('user_name'),
            User.email.label('user_email')
        )
        .select_from(Role)
        .outerjoin(permissions_sub, Role.id == permissions_sub.c.role_id)
        .outerjoin(User, Role.id == User.role_id)
        .order_by(Role.name, User.name)
    )

    result_rup = await db.execute(stmt)
    rups= result_rup.fetchall()

    rs = [RoleWithPermissionsAndUserOut(
        role_id=row[0],
        role_name=row[1],
        permissions=row[2],
        #permissions_list=[perm.strip() for perm in row[2].split(', ')],
        user_id=row[3],
        user_name=row[4],
        user_email=row[5]
    ) for row in rups]

    print(f"rs: {rs}")

    # Convert tuples to Pydantic models
    output_rups = []
    """for row in rups:
        permissions_str = row[2]
        permissions_list = (
            [perm.strip() for perm in permissions_str.split(', ')]
            if permissions_str
            else []
        )

        # Build optional user object
        user_id = row[3]
        user_obj = None
        if user_id is not None:
            print(f"user_id: {user_id}")
            user_obj = UserOut(
                id=int(user_id),
                name=row[4],
                email=row[5]
            )

        model_instance = RoleWithPermissionsAndUserOut(
            role_id=row[0],
            role_name=row[1],
            permissions=permissions_str,
            permissions_list=permissions_list,
            user=user_obj,
            user_id=row[3],
            user_name=row[4],
            user_email=row[5]
        )"""
        #output_rups.append(model_instance)

    #print(f"output_rups: {output_rups}")

    # dict
    for row in rups:
        role_dict = {
            'role_id': row[0],
            'role_name': row[1],
            'permissions': row[2],
            'permissions_list': [],
            'user': None,
            'user_id': row[3],
            'user_name': row[4],
            'user_email': row[5],
            'has_user': False,
            'has_permissions': False
        }


        role_dict["permissions_list"] = (
            [perm.strip() for perm in role_dict['permissions'].split(', ')]
            if role_dict['permissions']
            else []
        )

        role_dict["has_permissions"] = True if role_dict['permissions'] else False


        # Build optional user object
        user_id = role_dict["user_id"]
        user_obj = None
        if user_id is not None:
            print(f"user_id: {user_id}")
            role_dict["has_user"] = True
            user_obj = UserOut(
                id=int(user_id),
                name=row[4],
                email=row[5]
            )
            role_dict["user"] = user_obj
        else:
            role_dict["has_user"] = False

        model_instance = RoleWithPermissionsAndUserOut.model_validate(role_dict)
        output_rups.append(model_instance)
        print(f"role_dict: {role_dict}")
        print(f"model_instance: {model_instance}")

    print(f"output_rups: {output_rups}")




    return {
        "status_code": 200,
        "message": "Get all roles successfully",
        "data": output_rups
    }


@roles_router.get("/all/count")
async def get_count_roles(current_user=None, db: AsyncSession = Depends(get_db)):
    stmt = select(func.count(Role.id))  # Or func.count() for all rows
    result = await db.execute(stmt)  # scalar() for single value
    count = result.scalar()
    if not count:
        raise HTTPException(status_code=404, detail="Users not found")

    return {
        "status_code": 200,
        "message": "Roles count",
        "data": {"count": count}
    }
