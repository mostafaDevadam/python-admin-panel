"use client";

import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AUDIT_LOG_TYPE, KeyValue, USER_TYPE } from '../../_types/types';
import DataTable from './DataTable';



type Props = {
    logs: AUDIT_LOG_TYPE[]
}

const AuditLogDataTable = ({ logs }: Props) => {

    const keys = [...new Set(logs.flatMap(obj => Object.keys(obj)))];  // Unique keys: ['name', 'age']

    const k = keys.map((m) => ((m != "id") ? m : null))

    console.log("k:", k)

    return (
        <DataTable
            title='AuditLogs'
            
            header_row={k && k.map((m, index) => m != null && <TableHead key={index}>{m}</TableHead>)}
            body_row={
                logs && logs.map((m, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{m.action}</TableCell>
                        <TableCell className="font-medium">{m.ip}</TableCell>
                        <TableCell className="font-medium">{m.created_at}</TableCell>
                        <TableCell className="font-medium">{m.user?.name}</TableCell>
                    </TableRow>
                ))
            }
        />
    )
}

export default AuditLogDataTable