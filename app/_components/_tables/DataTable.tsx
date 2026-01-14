"use client";

import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { KeyValue } from '../../_types/types';



type Props = {
    header_row: React.ReactNode,
    body_row: React.ReactNode,
    title: string
    classStyle?: string
}

const DataTable = ({ header_row, body_row , title, classStyle}: Props) => {
    return (
        <Table>
            <TableCaption>A list of your recent {title}.</TableCaption>
            <TableHeader className=''>
                <TableRow>
                    {
                        header_row
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    body_row
                }
            </TableBody>
        </Table>
    )
}

export default DataTable