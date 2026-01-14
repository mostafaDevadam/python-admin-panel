"use client";

import { PERMISSION_TYPE, ROLE_TYPE, USER_TYPE } from '@/app/_types/types';
import React, { useActionState, useEffect } from 'react'
import SelectOptions from './_inputs/SelectOptions';
import { toast } from 'react-toastify';

type Props = {
    action: (prevState: any, formData: FormData) => Promise<any>
    data?: ROLE_TYPE[] | USER_TYPE[] | null,
    permissionId?: number
    roleId?: number
    selectOptionTagName: string
    permission?: PERMISSION_TYPE

}

const FormAssign = ({action, data, permissionId, roleId, selectOptionTagName, permission}: Props) => {
    const [state, formAction] = useActionState(action, null)
    useEffect(() => {
        if(state?.success){
            toast("assigned successfully")
            // redirect("/")
        }

        if(state?.error){
            toast(state.error)
        }

    }, [ state ])
    

    useEffect(() => {
        // const list = data!!.map((item: PERMISSION_TYPE) => item.)
        console.log("permission:", permission)
    }, [data, permission])
    
  return (
    <form action={formAction}>
        {permissionId && <input hidden name="permissionId" defaultValue={permissionId} value={permissionId} />}
        {roleId && <input hidden name="roleId" defaultValue={roleId} value={roleId} />}
        <SelectOptions tagName={selectOptionTagName} data={data!!} permission={permission} />
        <div className='mt-5 flex justify-end'>
            <button type='submit' className='bg-blue-500 text-white px-2 py-2 rounded-lg w-full'>Assign</button>
        </div>
    </form>
  )
}

export default FormAssign