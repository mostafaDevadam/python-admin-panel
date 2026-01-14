"use client";

import { SERVER_ACTION_PAYLOAD_TYPE } from '@/app/_types/types';
import React, { useActionState, useEffect } from 'react'
import { toast } from 'react-toastify';

type Props = {
    action: (prevState: any, formData: FormData) => Promise<SERVER_ACTION_PAYLOAD_TYPE<any>>
    roleId: number
    permissionId?: number
    userId?: number

}
const UnassignButton = ({ action, roleId, permissionId, userId }: Props) => {
    const [state, formAction] = useActionState(action, null)
    useEffect(() => {
        if(state?.success){
            toast("unassigned successfully")
        }

        if(state?.error){
            toast(state.error)
        }
        
    }, [state])
    return (
        <form action={formAction}>
            {roleId && <input type="hidden" name="roleId" defaultValue={roleId} />}
            {permissionId && <input type="hidden" name="permissionId" defaultValue={permissionId} />}
            {userId && <input type="hidden" name="userId" defaultValue={userId} />}
            <button type='submit' className='text-amber-600'>Unassign</button>
        </form>
    )
}

export default UnassignButton