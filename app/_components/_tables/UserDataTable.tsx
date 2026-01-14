"use client";

import React, { use } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KeyValue, USER_TYPE } from '../../_types/types';
import DataTable from './DataTable';
import { useRolePermissions } from '@/app/_hooks/useRolePermissions';
import Link from 'next/link';



type Props = {
    users: USER_TYPE[]
}

const UserDataTable = ({ users }: Props) => {
    const { read, update, remove } = useRolePermissions()

    const keys = [...new Set(users.flatMap(obj => Object.keys(obj)))];  // Unique keys: ['name', 'age']

    const k = keys.map((m) => m != "id" ? m : null)

    console.log("k:", k)

    return (

        <DataTable
            title='Users'
            header_row={
                <>
                    {(k && k.map((m, index) => m != null && <TableHead key={index}>{m}</TableHead>))}
                    <TableHead></TableHead>
                    {(update("users") || remove("users")) && <TableHead>Actions</TableHead>}
                </>
            }
            body_row={
                <>
                    {
                        users && users.map((m, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{m.name}</TableCell>
                                <TableCell className="font-medium">{m.email}</TableCell>
                                <TableCell className="font-medium">{m.role?.name}</TableCell>
                                <TableCell className="font-medium">{m.is_active}</TableCell>
                                
                                {(read("users") || update("users") || remove("users")) &&
                                    <TableCell className="font-medium flex gap-3 me-10">
                                        {read("users") && <Link href={`/users/${m.id}`} className='text-fuchsia-600'>View</Link>}
                                        {update("users") && <button className='text-blue-600'>Edit</button>}
                                        {remove("users") && <button className='text-red-600'>Delete</button>}
                                    </TableCell>}
                            </TableRow>
                        ))
                    }

                </>



            }

        />

    )
}

export default UserDataTable