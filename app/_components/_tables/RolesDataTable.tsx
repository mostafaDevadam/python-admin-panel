"use client";

import { ROLE_TYPE, USER_TYPE } from '@/app/_types/types';
import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DataTable from './DataTable';
import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import DialogAssign from '../_dialogs/DialogAssign';
import SelectOptions from '../_forms/_inputs/SelectOptions';
import FormAssign from '../_forms/FormAssign';
import { assignRoleToUserAction, unAssignRoleToUserAction } from '@/app/actions/roles.actions';
import UnassignButton from '../_buttons/UnassignButton';

type Props = {
    roles: ROLE_TYPE[]
    users: USER_TYPE[]
}
const RolesDataTable = ({ roles, users }: Props) => {
    const { update, remove } = useRolePermissions()

    const keys = [...new Set(roles.flatMap(obj => Object.keys(obj)))];  // Unique keys: ['name', 'age']

    const ks = ["id", "has_user", "has_permissions", "role_id", "permissions_list" ]

    const kp = ["role_name", "permissions", "user"]

    const k = keys.map((m) => !ks.includes(m) && kp.includes(m) ? m : null)

    console.log("k:", k)


    return (
        <DataTable
            title='Roles'
            header_row={
                <>
                    {(k && k.map((m, index) => m != null && <TableHead key={index} className='capitalize'>{m === "role_name" ? "role name" : m }</TableHead>))}

                    {(update("roles") || remove("roles")) && <TableHead>Actions</TableHead>}
                </>
            }
            body_row={
                roles && roles.map((role, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{role.name || role.role_name}</TableCell>
                        <TableCell className="font-medium">
                            {role.permissions_list!!.map((p, p_index) => <p key={p_index}>{p}</p>)}
                        </TableCell>
                        <TableCell className="font-medium">
                            {role.user ? role.user.name : null}
                        </TableCell>

                        {(update("roles") || remove("roles")) && <TableCell className="font-medium flex gap-3 me-10">
                            {update("roles") &&
                                (
                                    role.has_user ?
                                        <UnassignButton action={unAssignRoleToUserAction} roleId={role.id ? role.id!! : role.role_id!!} userId={role.user?.id} />
                                        :
                                        <DialogAssign dialogTitle='Assign Role' button={<button className='text-green-600'>Assign</button>}>
                                            <FormAssign action={assignRoleToUserAction} data={users}
                                                roleId={role.id ? role.id : role.role_id} selectOptionTagName='userId' />
                                        </DialogAssign>
                                )

                            }
                            {update("roles") && <button className='text-blue-600'>Edit</button>}
                            {remove("roles") && <button className='text-red-600'>Delete</button>}
                        </TableCell>}

                    </TableRow>
                ))
            }
        />
    )
}

export default RolesDataTable