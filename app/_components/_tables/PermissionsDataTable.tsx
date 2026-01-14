"use client";

import { PERMISSION_TYPE, ROLE_TYPE } from '@/app/_types/types';
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DataTable from './DataTable';
import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import { toast } from 'react-toastify';
import DialogAssign from '../_dialogs/DialogAssign';
import SelectOptions from '../_forms/_inputs/SelectOptions';
import FormAssign from '../_forms/FormAssign';
import { assignPermissionToRoleAction, unAssignPermissionToRoleAction } from '@/app/actions/permissions.actions';
import UnassignButton from '../_buttons/UnassignButton';

type Props = {
    permissions: PERMISSION_TYPE[]
    roles: ROLE_TYPE[]
    roles_not_assigned_to_permissions?: ROLE_TYPE[]
}
const PermissionsDataTable = ({ permissions, roles, roles_not_assigned_to_permissions }: Props) => {
    const { update, remove } = useRolePermissions()
    const keys = [...new Set(permissions.flatMap(obj => Object.keys(obj)))];  // Unique keys: ['name', 'age']
    const ks = [ "id", "has_role", "role", ]

    const k = keys.map((m) => !ks.includes(m) ? m : null)

    console.log("k:", k)

    return (
        <DataTable
            title='Permissions'
            header_row={
                <>
                    {(k && k.map((m, index) => m != null && <TableHead key={index}>{m}</TableHead>))}

                    {(update("permissions") || remove("permissions")) && <TableHead>Actions</TableHead>}
                </>
            }
            body_row={
                permissions && permissions.map((perm, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{perm.name}</TableCell>
                        <TableCell className="font-medium">{perm.description}</TableCell>
                        <TableCell className="font-medium">{perm.resource}</TableCell>
                        
                        {(update("permissions") || remove("permissions")) && <TableCell className="font-medium flex gap-3 me-10">
                            {update("permissions") &&
                                (
                                  perm.has_role ?
                                  <UnassignButton action={unAssignPermissionToRoleAction} roleId={perm.role?.id!!} permissionId={perm.id} />
                                   
                                  :

                                <DialogAssign dialogTitle='Assign Permission' button={<button className='text-green-600'>Assign</button>}>
                                    {<FormAssign
                                        action={assignPermissionToRoleAction}
                                        data={roles_not_assigned_to_permissions}
                                        permission={perm}
                                        permissionId={perm.id}
                                        selectOptionTagName='roleId' />}
                                    <></>
                                </DialogAssign>
                                )

                            }
                            {update("permissions") && <button className='text-blue-600'>Edit</button>}
                            {remove("permissions") && <button className='text-red-600'>Delete</button>}
                        </TableCell>}
                    </TableRow>
                ))
            }
        />
    )
}

export default PermissionsDataTable